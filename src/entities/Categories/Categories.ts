import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { ICategories } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryCategories implements IRepoClass<ICategories> {

  generateData(amount: number): ICategories[] {
    const categories: ICategories[] = [];

    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 5 });

      const name = faker.commerce.department();
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      categories.push({
        id: faker.string.nanoid(),
        name,
        slug,
        created_at: created,
        updated_at: faker.date.between({ from: created, to: new Date() })
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
      r.created_at,
      r.updated_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO CATEGORIES (
        name,
        slug,
        created_at,
        updated_at
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
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns = 'id,name,slug,created_at,updated_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Categories.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de categorías:', error);
      throw error;
    }
  }
}
