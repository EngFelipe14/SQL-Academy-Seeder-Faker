import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IOrderItems } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryOrderItems implements IRepoClass<IOrderItems> {

  generateData(amount: number, options?: SeederOptions): IOrderItems[] {
    const orderItems: IOrderItems[] = [];

    if (!options?.orders || !options?.productVariants) throw new Error('Faltan los parámetros "orders" o "productVariants". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');

    for (let i = 0; i < amount; i++) {
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = faker.number.float({ min: 10, max: 500});
      const lineTotal = quantity * unitPrice;

      orderItems.push({
        id: i + 1,
        order_id: faker.number.int({ min: 1, max: options.orders }),
        product_variant_id: faker.number.int({ min: 1, max: options.productVariants }),
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        sku_snapshot: faker.string.alphanumeric({ length: 10 }).toUpperCase()
      });
    }

    return orderItems;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest) ;

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los items de orden');

    const values = records.flatMap(r => [
      r.order_id,
      r.product_variant_id,
      r.quantity,
      r.unit_price,
      r.line_total,
      r.sku_snapshot
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO ORDER_ITEMS (
        order_id,
        product_variant_id,
        quantity,
        unit_price,
        line_total,
        sku_snapshot
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en ORDER_ITEMS:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.order_id}"`,
        `"${r.product_variant_id}"`,
        `"${r.quantity}"`,
        `"${r.unit_price}"`,
        `"${r.line_total}"`,
        `"${r.sku_snapshot}"`
      ].join(','))
      .join('\n');

    const columns =
      'id,order_id,product_variant_id,quantity,unit_price,line_total,sku_snapshot\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/OrderItems.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de OrderItems:', error);
      throw error;
    }
  }
}
