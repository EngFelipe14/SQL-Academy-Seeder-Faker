import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IProducts } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryProducts implements IRepoClass<IProducts> {

  generateData(amount: number): IProducts[] {
    const products: IProducts[] = [];

    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 10 });

      products.push({
        id: i + 1,
        sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        base_price: parseFloat(faker.commerce.price({ min: 10, max: 2000, dec: 2 })),
        is_active: faker.datatype.boolean({ probability: 0.85 }),
        created_at: created,
        updated_at: faker.date.between({ from: created, to: new Date() })
      });
    }

    return products;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<IProducts, 'id'>> = this.generateData(amount).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.sku,
      r.name,
      r.description,
      r.base_price,
      r.is_active,
      toMySQLDateTime(r.created_at),
      toMySQLDateTime(r.updated_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PRODUCTS (
        sku,
        name,
        description,
        base_price,
        is_active,
        created_at,
        updated_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando productos:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => [
        `"${r.id}"`,
        `"${r.sku}"`,
        `"${r.name}"`,
        `"${r.description}"`,
        `"${r.base_price}"`,
        `"${r.is_active}"`,
        `"${toMySQLDateTime(r.created_at)}"`,
        `"${toMySQLDateTime(r.updated_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,sku,name,description,base_price,is_active,created_at,updated_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Products.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Products:', error);
      throw error;
    }
  }
}
