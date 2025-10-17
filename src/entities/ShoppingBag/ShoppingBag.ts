import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IShoppingBag } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryShoppingBag implements IRepoClass<IShoppingBag> {

  generateData(amount: number, options?: SeederOptions): IShoppingBag[] {
    const bags: IShoppingBag[] = [];

    if (!options?.customers) throw new Error('Falta el parámetro "customers". \n Este es necesario para generar los datos con IDs válidos y mantener la integridad referencial.');

    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 9 });

      bags.push({
        id: i + 1,
        customer_id: faker.number.int({ min: 1, max: options.customers }),
        session_id: faker.string.alphanumeric(10),
        status: faker.helpers.arrayElement(['active', 'converted', 'abandoned'] as const),
        created_at: createdAt,
        updated_at: faker.date.between({ from: createdAt, to: new Date() })
      });
    }

    return bags;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente las bolsas de compras');

    const values = records.flatMap(r => [
      r.customer_id,
      r.session_id,
      r.status,
      toMySQLDateTime(r.created_at),
      toMySQLDateTime(r.updated_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO SHOPPING_BAG (
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

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.customer_id}"`,
        `"${r.session_id}"`,
        `"${r.status}"`,
        `"${toMySQLDateTime(r.created_at)}"`,
        `"${toMySQLDateTime(r.updated_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,customer_id,session_id,status,created_at,updated_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ShoppingBag.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de ShoppingBag:', error);
      throw error;
    }
  }
}
