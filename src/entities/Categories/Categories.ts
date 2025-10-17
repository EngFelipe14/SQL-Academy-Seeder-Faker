import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { ICategories } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryCategories implements IRepoClass<ICategories> {

  generateData(amount: number): ICategories[] {
    const categories: ICategories[] = [];

    for (let i = 0; i < amount; i++) {

      const name = faker.commerce.department();
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + faker.string.alphanumeric(10);

      categories.push({
        id: i + 1,
        name,
        slug,
        created_at: faker.date.past({ years: 10 })
      });
    }

    return categories;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<ICategories, 'id'>> = this.generateData(amount).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.name,
      r.slug,
      toMySQLDateTime(r.created_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?)').join(', ');

    const query = `
      INSERT INTO CATEGORIES (
        name,
        slug,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando categorías:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => [
        `"${r.id}"`,
        `"${r.name}"`,
        `"${r.slug}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,name,slug,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Categories.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Categories:', error);
      throw error;
    }
  }
}
