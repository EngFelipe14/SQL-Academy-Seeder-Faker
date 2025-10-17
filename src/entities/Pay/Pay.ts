import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IPay } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryPay implements IRepoClass<IPay> {

  generateData(amount: number, options?: SeederOptions): IPay[] {
    const payments: IPay[] = [];

    if (!options?.orders || !options?.paymentMethods) throw new Error('Faltan los parámetros "orders" o "paymentMethods". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');

    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 9 });

      payments.push({
        id: i + 1,
        order_id: faker.number.int({ min: 1, max: options.orders }),
        payment_method_id: faker.number.int({ min: 1, max: options.paymentMethods }),
        amount: faker.number.float({ min: 10, max: 2000}),
        currency: faker.helpers.arrayElement(['USD', 'EUR', 'COP', 'MXN']),
        status: faker.helpers.arrayElement(['pending', 'authorized', 'captured', 'failed', 'refunded']),
        transaction_id: faker.string.alphanumeric(10),
        paid_at: faker.date.between({ from: created, to: new Date() }),
        created_at: created
      });
    }

    return payments;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);
    if (records.length !== amount) throw new Error('No se generaron correctamente los pagos');

    const values = records.flatMap(r => [
      r.order_id,
      r.payment_method_id,
      r.amount,
      r.currency,
      r.status,
      r.transaction_id,
      toMySQLDateTime(r.paid_at),
      toMySQLDateTime(r.created_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PAY (
        order_id,
        payment_method_id,
        amount,
        currency,
        status,
        transaction_id,
        paid_at,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en PAY:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.order_id}"`,
        `"${r.payment_method_id}"`,
        `"${r.amount}"`,
        `"${r.currency}"`,
        `"${r.status}"`,
        `"${r.transaction_id}"`,
        `"${toMySQLDateTime(r.paid_at)}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns =
      'id,order_id,payment_method_id,amount,currency,status,transaction_id,paid_at,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Pay.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Pay:', error);
      throw error;
    }
  }
}
