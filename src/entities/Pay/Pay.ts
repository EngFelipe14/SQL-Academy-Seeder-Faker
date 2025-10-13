import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IPay } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryPay implements IRepoClass<IPay> {

  generateData(amount: number): IPay[] {
    const payments: IPay[] = [];

    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 2 });
      const paidAt = faker.date.between({ from: created, to: new Date() });
      const statuses: IPay['status'][] = ['pending', 'authorized', 'captured', 'failed', 'refunded'];

      payments.push({
        id: faker.string.nanoid(),
        order_id: faker.number.int({ min: 1, max: 5000 }),
        payment_method_id: faker.number.int({ min: 1, max: 1000 }),
        amount: faker.number.float({ min: 10, max: 2000}),
        currency: faker.helpers.arrayElement(['USD', 'EUR', 'COP', 'MXN']),
        status: faker.helpers.arrayElement(statuses),
        transaction_id: faker.number.int({ min: 1000000, max: 9999999 }),
        paid_at: paidAt,
        created_at: created
      });
    }

    return payments;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);
    if (records.length !== amount) throw new Error('No se generaron correctamente los pagos');

    const values = records.flatMap(r => [
      r.id,
      r.order_id,
      r.payment_method_id,
      r.amount,
      r.currency,
      r.status,
      r.transaction_id,
      r.paid_at,
      r.created_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PAY (
        id,
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

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r).join(','))
      .join('\n');

    const columns =
      'id,order_id,payment_method_id,amount,currency,status,transaction_id,paid_at,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Pay.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de PAY:', error);
      throw error;
    }
  }
}
