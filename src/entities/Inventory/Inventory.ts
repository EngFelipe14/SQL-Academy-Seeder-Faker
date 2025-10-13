import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IInventory } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryInventory implements IRepoClass<IInventory> {

  generateData(amount: number): IInventory[] {
    const inventories: IInventory[] = [];

    for (let i = 0; i < amount; i++) {
      inventories.push({
        id: faker.string.nanoid(),
        product_variant_id: faker.number.int({ min: 1, max: 2000 }),
        warehouse_id: faker.number.int({ min: 1, max: 50 }),
        quantity_available: faker.number.int({ min: 0, max: 500 }),
        quantity_reserved: faker.number.int({ min: 0, max: 100 }),
        update_at: faker.date.recent({ days: 60 }),
      });
    }

    return inventories;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los registros de inventario');

    const values = records.flatMap(r => [
      r.id,
      r.product_variant_id,
      r.warehouse_id,
      r.quantity_available,
      r.quantity_reserved,
      r.update_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO INVENTORY (
        id,
        product_variant_id,
        warehouse_id,
        quantity_available,
        quantity_reserved,
        update_at
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

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns = 'id,product_variant_id,warehouse_id,quantity_available,quantity_reserved,update_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Inventory.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de INVENTORY:', error);
      throw error;
    }
  }
}
