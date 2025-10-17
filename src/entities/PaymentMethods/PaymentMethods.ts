import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IPaymentMethods } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryPaymentMethods implements IRepoClass<IPaymentMethods> {

  generateData(amount: number): IPaymentMethods[] { 
    const paymentMethods: IPaymentMethods[] = [];

    for (let i = 0; i < amount; i++) {
      const provider = faker.helpers.arrayElement([
        'VISA',
        'MasterCard',
        'PayPal',
        'Stripe',
        'American Express',
        'Apple Pay',
        'Google Pay'
      ]);

      const methodName = faker.helpers.arrayElement([
        'Credit Card',
        'Debit Card',
        'Digital Wallet',
        'Bank Transfer'
      ]);

      const details = {
        cardNumber: faker.finance.creditCardNumber({ issuer: provider }),
        expiration: toMySQLDateTime(faker.date.future({ years: 5 })),
        cvv: faker.string.numeric(3),
      };

      paymentMethods.push({
        id: i + 1,
        name: methodName,
        provider,
        details: details as unknown as JSON,
        is_active: faker.datatype.boolean({ probability: 0.8 }),
        created_at: faker.date.past({years: 10})
      });
    }

    return paymentMethods;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<IPaymentMethods, 'id'>> = this.generateData(amount).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.name,
      r.provider,
      JSON.stringify(r.details),
      r.is_active,
      toMySQLDateTime(r.created_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PAYMENT_METHODS (
        name,
        provider,
        details,
        is_active,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando métodos de pago:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => [
        `"${r.id}"`,
        `"${r.name}"`,
        `"${r.provider}"`,
        `"${JSON.stringify(r.details)}"`,
        `"${r.is_active}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,customer_id,name,provider,datails,is_active\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/PaymentMethods.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de PaymentMethods:', error);
      throw error;
    }
  }
}
