import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IReviews } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryReviews implements IRepoClass<IReviews> {

  generateData(amount: number): IReviews[] {
    const reviews: IReviews[] = [];

    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 3 });

      reviews.push({
        id: faker.string.nanoid(),
        customer_id: faker.number.int({ min: 1, max: 5000 }),
        product_variant_id: faker.number.int({ min: 1, max: 5000 }),
        product_id: faker.number.int({ min: 1, max: 5000 }),
        rating: faker.datatype.boolean({ probability: 0.75 }), // mayoría positivos
        title: faker.lorem.words({ min: 2, max: 6 }),
        comment: faker.lorem.sentences({ min: 1, max: 3 }),
        created_at: createdAt
      });
    }

    return reviews;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);
    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos de reviews');

    const values = records.flatMap(r => [
      r.id,
      r.customer_id,
      r.product_variant_id,
      r.product_id,
      r.rating,
      r.title,
      r.comment,
      r.created_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO REVIEWS (
        id,
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

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => [
        r.id,
        r.customer_id,
        r.product_variant_id,
        r.product_id,
        r.rating,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.comment.replace(/"/g, '""')}"`,
        r.created_at.toISOString()
      ].join(','))
      .join('\n');

    const columns = 'id,customer_id,product_variant_id,product_id,rating,title,comment,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Reviews.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de REVIEWS:', error);
      throw error;
    }
  }
}
