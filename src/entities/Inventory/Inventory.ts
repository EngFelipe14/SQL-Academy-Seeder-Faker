import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IInventory } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryInventory implements IRepoClass<IInventory> {

 generateData(amount: number, options?: SeederOptions): IInventory[] {
  const inventories: IInventory[] = [];

  if (!options?.productVariants || !options?.warehouses) throw new Error('Faltan los parámetros "productVariants" o "warehouses". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');

  const usedCombinations = new Set<string>();
  
  let product_variant_id: number;
  let warehouse_id: number;
  let uniqueKey: string;

  for (let i = 0; i < amount; i++) {
    do {
      product_variant_id = faker.number.int({ min: 1, max: options.productVariants });
      warehouse_id = faker.number.int({ min: 1, max: options.warehouses });
      uniqueKey = `${product_variant_id}-${warehouse_id}`;
    } while (usedCombinations.has(uniqueKey));

    usedCombinations.add(uniqueKey);

    inventories.push({
      id: i + 1,
      product_variant_id,
      warehouse_id,
      quantity_available: faker.number.int({ min: 0, max: 500 }),
      quantity_reserved: faker.number.int({ min: 0, max: 100 }),
      updated_at: faker.date.recent({ days: 60 }),
    });
  }

  return inventories;
}


  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los registros de inventario');

    const values = records.flatMap(r => [
      r.product_variant_id,
      r.warehouse_id,
      r.quantity_available,
      r.quantity_reserved,
      toMySQLDateTime(r.updated_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO INVENTORY (
        product_variant_id,
        warehouse_id,
        quantity_available,
        quantity_reserved,
        updated_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en INVENTORY:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.product_variant_id}"`,
        `"${r.warehouse_id}"`,
        `"${r.quantity_available}"`,
        `"${r.quantity_reserved}"`,
        `"${toMySQLDateTime(r.updated_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,product_variant_id,warehouse_id,quantity_available,quantity_reserved,update_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Inventory.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Inventory:', error);
      throw error;
    }
  }
}
