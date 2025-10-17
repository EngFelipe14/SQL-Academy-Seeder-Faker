import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { ICoupons } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryCoupons implements IRepoClass<ICoupons> {

  generateData(amount: number): ICoupons[] {
    const coupons: ICoupons[] = [];

    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 2 });
      const discountType: ICoupons['discount_type'][] = ['percentage', 'fixed'];

      coupons.push({
        id: i + 1,
        code: faker.string.alphanumeric({ length: 8 }),
        discount_type: faker.helpers.arrayElement(discountType),
        discount_value: faker.number.float({ min: 5, max: 200}),
        min_order_amount: faker.number.float({ min: 20, max: 300}),
        expires_at: faker.date.future({ years: 1, refDate: createdAt }),
        usage_limit: faker.number.int({ min: 1, max: 50 }),
        created_at: createdAt
      });
    }

    return coupons;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount).map(({id, ...rest}) => rest);
    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos de cupones');

    const values = records.flatMap(r => [
      r.code,
      r.discount_type,
      r.discount_value,
      r.min_order_amount,
      toMySQLDateTime(r.expires_at),
      r.usage_limit,
      toMySQLDateTime(r.created_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO COUPONS (
        code,
        discount_type,
        discount_value,
        min_order_amount,
        expires_at,
        usage_limit,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en COUPONS:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => [
        `"${r.id}"`,
        `"${r.code}"`,
        `"${r.discount_type}"`,
        `"${r.discount_value}"`,
        `"${r.min_order_amount}"`,
        `"${toMySQLDateTime(r.expires_at)}"`,
        `"${r.usage_limit}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,code,discount_type,discount_value,min_order_amount,expires_at,usage_limit,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Coupons.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Coupons:', error);
      throw error;
    }
  }
}
