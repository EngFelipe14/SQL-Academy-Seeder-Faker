import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IProductCategories } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryProductCategories implements IRepoClass<IProductCategories> {

  generateData(amount: number, options?: SeederOptions): IProductCategories[] {
    const relations: IProductCategories[] = [];

    if (!options?.products || !options?.categories) throw new Error('Faltan los parámetros "products" o "categories". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');

    const uniqueRelations = new Set<string>();

    while (relations.length < amount) {
      const product_id = faker.number.int({ min: 1, max: options.products });
      const category_id = faker.number.int({ min: 1, max: options.categories });
      const relationKey = `${product_id}-${category_id}`;

      if (!uniqueRelations.has(relationKey)) {
        uniqueRelations.add(relationKey);
        relations.push({
          product_id,
          category_id
        });
      }
    }

    return relations;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options);

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

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.product_id}"`,
        `"${r.category_id}"`
      ].join(','))
      .join('\n');

    const columns = 'product_id,category_id\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ProductCategories.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de ProductCategories:', error);
      throw error;
    }
  }
}
