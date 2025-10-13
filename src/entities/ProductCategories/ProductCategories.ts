import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IProductCategories } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryProductCategories implements IRepoClass<IProductCategories> {

  generateData(amount: number): IProductCategories[] {
    const relations: IProductCategories[] = [];

    for (let i = 0; i < amount; i++) {
      relations.push({
        product_id: faker.number.int({ min: 1, max: 1000 }),
        category_id: faker.number.int({ min: 1, max: 50 })
      });
    }

    return relations;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente las relaciones producto-categoría');

    const values = records.flatMap(r => [r.product_id, r.category_id]);
    const placeholders = records.map(() => '(?, ?)').join(', ');

    const query = `
      INSERT INTO PRODUCT_CATEGORIES (
        product_id,
        category_id
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando relaciones producto-categoría:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns = 'product_id,category_id\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ProductCategories.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de relaciones producto-categoría:', error);
      throw error;
    }
  }
}
