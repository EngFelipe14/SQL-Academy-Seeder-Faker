import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IOrders } from '../../models/interfaces/modelEntities.ts';
import { faker} from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryOrders implements IRepoClass<IOrders> {

  generateData(amount: number, options?: SeederOptions): IOrders[] {
    const orders: IOrders[] = [];

    if (!options?.customers || !options?.addresses || !options?.paymentMethods) throw new Error('Faltan los parámetros "customers",  "addresses" o "paymentMethods". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');


    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 9 });

      const subtotal = faker.number.float({ min: 20, max: 1000});
      const shippingCost = faker.number.float({ min: 0, max: 50});
      const taxAmount = subtotal * 0.19; // IVA 19%
      const total = subtotal + shippingCost + taxAmount;

      orders.push({
        id: i + 1,
        order_number: faker.string.nanoid(10),
        customer_id: faker.number.int({ min: 1, max: options.customers }),
        billing_address_id: faker.number.int({ min: 1, max: options.addresses }),
        shipping_address_id: faker.number.int({ min: 1, max: options.addresses }),
        status: faker.helpers.arrayElement([
          'pending',
          'paid',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded'
        ] as const),
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total,
        payment_method_id: faker.number.int({ min: 1, max: options.paymentMethods }),
        created_at: createdAt,
        updated_at: faker.date.between({ from: createdAt, to: new Date() })
      });
    }

    return orders;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente las órdenes');

    const values = records.flatMap(r => [
      r.order_number,
      r.customer_id,
      r.billing_address_id,
      r.shipping_address_id,
      r.status,
      r.subtotal,
      r.shipping_cost,
      r.tax_amount,
      r.total,
      r.payment_method_id,
      toMySQLDateTime(r.created_at),
      toMySQLDateTime(r.updated_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO ORDERS (
        order_number,
        customer_id,
        billing_address_id,
        shipping_address_id,
        status,
        subtotal,
        shipping_cost,
        tax_amount,
        total,
        payment_method_id,
        created_at,
        updated_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en ORDERS:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.order_number}"`,
        `"${r.customer_id}"`,
        `"${r.billing_address_id}"`,
        `"${r.shipping_address_id}"`,
        `"${r.status}"`,
        `"${r.subtotal}"`,
        `"${r.shipping_cost}"`,
        `"${r.tax_amount}"`,
        `"${r.total}"`,
        `"${r.payment_method_id}"`,
        `"${toMySQLDateTime(r.created_at)}"`,
        `"${toMySQLDateTime(r.updated_at)}"`
      ].join(','))
      .join('\n');

    const columns =
      'id,order_number,customer_id,billing_address_id,shipping_address_id,status,subtotal,shipping_cost,tax_amount,total,payment_method_id,created_at,updated_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Orders.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Orders:', error);
      throw error;
    }
  }
}