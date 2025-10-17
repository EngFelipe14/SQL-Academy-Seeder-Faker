import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { Ireceipt } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryReceipt implements IRepoClass<Ireceipt> {

  generateData(amount: number, options?: SeederOptions): Ireceipt[] {
    const receipts: Ireceipt[] = [];

    if (!options?.orders || !options?.pays) throw new Error('Faltan los parámetros "orders" o "pays". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');

    for (let i = 0; i < amount; i++) {
      const metadata = {
            issuer: faker.company.name(),
            note: faker.lorem.sentence(),
            digital_signature: faker.string.hexadecimal({ length: 16 }),
          } as unknown as JSON;

      receipts.push({
        id: i + 1,
        order_id: faker.number.int({ min: 1, max: options.orders }),
        payment_id: faker.number.int({ min: 1, max: options.pays }),
        receipt_number: faker.string.alphanumeric({ length: 10 }),
        issued_at: faker.date.past({ years: 9 }),
        metadata: metadata
      });
    }

    return receipts;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);
    if (records.length !== amount) throw new Error('No se generaron correctamente los recibos');

    const values = records.flatMap(r => [
      r.order_id,
      r.payment_id,
      r.receipt_number,
      toMySQLDateTime(r.issued_at),
      JSON.stringify(r.metadata)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO RECEIPT (
        order_id,
        payment_id,
        receipt_number,
        issued_at,
        metadata
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en RECEIPT:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.order_id}"`,
        `"${r.payment_id}"`,
        `"${r.receipt_number}"`,
        `"${toMySQLDateTime(r.issued_at)}"`,
        `"${JSON.stringify(r.metadata)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,order_id,payment_id,receipt_number,issued_at,metadata\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Receipt.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Receipt:', error);
      throw error;
    }
  }
}
