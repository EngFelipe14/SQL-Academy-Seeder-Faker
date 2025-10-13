import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IOrderItems } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryOrderItems implements IRepoClass<IOrderItems> {

  generateData(amount: number): IOrderItems[] {
    const orderItems: IOrderItems[] = [];

    for (let i = 0; i < amount; i++) {
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = faker.number.float({ min: 10, max: 500});
      const lineTotal = quantity * unitPrice;

      orderItems.push({
        id: faker.string.nanoid(),
        order_id: faker.number.int({ min: 1, max: 5000 }),
        product_variant_id: faker.number.int({ min: 1, max: 5000 }),
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        sku_snapshot: faker.string.alphanumeric({ length: 10 }).toUpperCase()
      });
    }

    return orderItems;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los items de orden');

    const values = records.flatMap(r => [
      r.id,
      r.order_id,
      r.product_variant_id,
      r.quantity,
      r.unit_price,
      r.line_total,
      r.sku_snapshot
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO ORDER_ITEMS (
        id,
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

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r).join(','))
      .join('\n');

    const columns =
      'id,order_id,product_variant_id,quantity,unit_price,line_total,sku_snapshot\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/OrderItems.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de ORDER_ITEMS:', error);
      throw error;
    }
  }
}
