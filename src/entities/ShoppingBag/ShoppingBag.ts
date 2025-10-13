import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IShoppingBag } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryShoppingBag implements IRepoClass<IShoppingBag> {

  generateData(amount: number): IShoppingBag[] {
    const bags: IShoppingBag[] = [];

    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 1 });

      bags.push({
        id: faker.string.nanoid(),
        customer_id: faker.number.int({ min: 1, max: 5000 }),
        session_id: faker.number.int({ min: 100000, max: 999999 }),
        status: faker.helpers.arrayElement(['active', 'converted', 'abandoned'] as const),
        created_at: createdAt,
        updated_at: faker.date.between({ from: createdAt, to: new Date() })
      });
    }

    return bags;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente las bolsas de compras');

    const values = records.flatMap(r => [
      r.id,
      r.customer_id,
      r.session_id,
      r.status,
      r.created_at,
      r.updated_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO SHOPPING_BAG (
        id,
        customer_id,
        session_id,
        status,
        created_at,
        updated_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en SHOPPING_BAG:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r =>
        Object.values(r).map(v => (v instanceof Date ? v.toISOString() : v ?? '')).join(',')
      )
      .join('\n');

    const columns = 'id,customer_id,session_id,status,created_at,updated_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ShoppingBag.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de SHOPPING_BAG:', error);
      throw error;
    }
  }
}
