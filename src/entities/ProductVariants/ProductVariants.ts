import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IProductVariants } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryProductVariants implements IRepoClass<IProductVariants> {

  generateData(amount: number, options?: SeederOptions): IProductVariants[] {
    const variants: IProductVariants[] = [];

    if (!options?.products) throw new Error('Falta el parámetro "products". \n Este es necesario para generar los datos con IDs válidos y mantener la integridad referencial.');

    for (let i = 0; i < amount; i++) {
      const metadata = {
        color: faker.color.human(),
        size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL']),
        material: faker.commerce.productMaterial(),
      } as unknown as JSON;

    variants.push({
      id: i + 1,
      product_id: faker.number.int({ min: 1, max: options.products }),
      sku: faker.string.alphanumeric({ length: 10, casing: 'upper' }),
      name: faker.commerce.productAdjective(),
      price_override: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
      barcode: faker.string.numeric(13),
      metadata: metadata,
      created_at: faker.date.past({ years: 9 })
    });
  }

    return variants;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<IProductVariants, 'id'>> = this.generateData(amount, options).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.product_id,
      r.sku,
      r.name,
      r.price_override,
      r.barcode,
      JSON.stringify(r.metadata),
      toMySQLDateTime(r.created_at)
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

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.product_id}"`,
        `"${r.sku}"`,
        `"${r.name}"`,
        `"${r.price_override}"`,
        `"${r.barcode}"`,
        `"${JSON.stringify(r.metadata)}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,product_id,sku,name,price_override,barcode,metadata,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ProductVariants.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de ProductVariants:', error);
      throw error;
    }
  }
}
