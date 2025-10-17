import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IReviews } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryReviews implements IRepoClass<IReviews> {

  generateData(amount: number, options?: SeederOptions): IReviews[] {
    const reviews: IReviews[] = [];

    if (!options?.customers || !options?.productVariants || !options?.products) throw new Error('Faltan los parámetros "customers" o "productVariants". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');


    for (let i = 0; i < amount; i++) {
      reviews.push({
        id: i + 1,
        customer_id: faker.number.int({ min: 1, max: options.customers }),
        product_variant_id: faker.number.int({ min: 1, max: options.productVariants }),
        product_id: faker.number.int({ min: 1, max: options.products }),
        rating: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
        title: faker.lorem.words({ min: 2, max: 6 }),
        comment: faker.lorem.sentences({ min: 1, max: 3 }),
        created_at: faker.date.past({ years: 9 })
      });
    }

    return reviews;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);
    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos de reviews');

    const values = records.flatMap(r => [
      r.customer_id,
      r.product_variant_id,
      r.product_id,
      r.rating,
      r.title,
      r.comment,
      toMySQLDateTime(r.created_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO REVIEWS (
        customer_id,
        product_variant_id,
        product_id,
        rating,
        title,
        comment,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en REVIEWS:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.customer_id}"`,
        `"${r.product_variant_id}"`,
        `"${r.product_id}"`,
        `"${r.rating}"`,
        `"${r.title}"`,
        `"${r.comment}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,customer_id,product_variant_id,product_id,rating,title,comment,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Reviews.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Reviews:', error);
      throw error;
    }
  }
}
