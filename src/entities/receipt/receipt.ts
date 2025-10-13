import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { Ireceipt } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryReceipt implements IRepoClass<Ireceipt> {

  generateData(amount: number): Ireceipt[] {
    const receipts: Ireceipt[] = [];

    for (let i = 0; i < amount; i++) {
      const issuedAt = faker.date.past({ years: 2 });

      receipts.push({
        id: faker.string.nanoid(),
        order_id: faker.number.int({ min: 1, max: 5000 }),
        payment_id: faker.number.int({ min: 1, max: 5000 }),
        receipt_number: `R-${faker.string.alphanumeric({ length: 10 }).toUpperCase()}`,
        issued_at: issuedAt,
        metadata: JSON.parse(
          JSON.stringify({
            issuer: faker.company.name(),
            note: faker.lorem.sentence(),
            digital_signature: faker.string.hexadecimal({ length: 16 }),
          })
        )
      });
    }

    return receipts;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);
    if (records.length !== amount) throw new Error('No se generaron correctamente los recibos');

    const values = records.flatMap(r => [
      r.id,
      r.order_id,
      r.payment_id,
      r.receipt_number,
      r.issued_at,
      JSON.stringify(r.metadata)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO RECEIPT (
        id,
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

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => [
        r.id,
        r.order_id,
        r.payment_id,
        r.receipt_number,
        r.issued_at.toISOString(),
        JSON.stringify(r.metadata).replace(/,/g, ';') // Evita romper el CSV
      ].join(','))
      .join('\n');

    const columns = 'id,order_id,payment_id,receipt_number,issued_at,metadata\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Receipt.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de RECEIPT:', error);
      throw error;
    }
  }
}
