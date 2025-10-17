import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IInventoryMovements } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryInventoryMovements implements IRepoClass<IInventoryMovements> {

  generateData(amount: number, options?: SeederOptions): IInventoryMovements[] {
    const movements: IInventoryMovements[] = [];

    if (!options?.productVariants || !options?.warehouses) {
      throw new Error('Faltan los parámetros "productVariants" o "warehouses". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');
    }

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

      movements.push({
        id: i + 1,
        product_variant_id,
        warehouse_id,
        change_qty: faker.number.int({ min: -50, max: 50 }),
        movement_type: faker.helpers.arrayElement([
          'PURCHASE_ORDER',
          'SALE',
          'RETURN',
          'ADJUSTMENT',
          'TRANSFER',
          'RESERVATION',
          'RELEASE',
        ]),
        reference_id: faker.datatype.boolean(.80) ? faker.number.int({ min: 1, max: 1000 }) : null,
        notes: faker.datatype.boolean(0.80) ? faker.lorem.sentence() : null,
        created_at: faker.date.past({years: 9}),
      });
    }

    return movements;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los registros de movimientos de inventario');

    const values = records.flatMap(r => [
      r.product_variant_id,
      r.warehouse_id,
      r.change_qty,
      r.movement_type,
      r.reference_id,
      r.notes,
      toMySQLDateTime(r.created_at),
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO INVENTORY_MOVEMENTS (
        product_variant_id,
        warehouse_id,
        change_qty,
        movement_type,
        reference_id,
        notes,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en INVENTORY_MOVEMENTS:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.product_variant_id}"`,
        `"${r.warehouse_id}"`,
        `"${r.change_qty}"`,
        `"${r.movement_type}"`,
        `"${r.reference_id}"`,
        `"${r.notes}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,product_variant_id,warehouse_id,change_qty,movement_type,reference_id,notes,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/InventoryMovements.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
     console.error('Error creando CSV de InventoryMovements:', error);
      throw error;
    }
  }

}
