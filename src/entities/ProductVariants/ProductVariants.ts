import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IProductVariants } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryProductVariants implements IRepoClass<IProductVariants> {

  generateData(amount: number): IProductVariants[] {
    const variants: IProductVariants[] = [];

    for (let i = 0; i < amount; i++) {
      const metadata = {
        color: faker.color.human(),
        size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL']),
        material: faker.commerce.productMaterial(),
      };

    variants.push({
      id: faker.string.nanoid(),
      product_id: faker.number.int({ min: 1, max: 1000 }),
      sku: faker.string.alphanumeric({ length: 10, casing: 'upper' }),
      name: faker.commerce.productAdjective(),
      price_override: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
      barcode: faker.string.numeric(13),
      metadata: metadata as unknown as JSON,
      created_at: faker.date.past({ years: 3 })
    });
  }

    return variants;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<IProductVariants, 'id'>> = this.generateData(amount).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.product_id,
      r.sku,
      r.name,
      r.price_override,
      r.barcode,
      JSON.stringify(r.metadata),
      r.created_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PRODUCT_VARIANTS (
        product_id,
        sku,
        name,
        price_override,
        barcode,
        metadata,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando variantes de producto:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => ({
        ...r,
        metadata: JSON.stringify(r.metadata)
      }))
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns = 'id,product_id,sku,name,price_override,barcode,metadata,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ProductVariants.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de variantes de producto:', error);
      throw error;
    }
  }
}
