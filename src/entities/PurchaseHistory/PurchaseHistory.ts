import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IPurchaseHistory } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryPurchaseHistory implements IRepoClass<IPurchaseHistory> {

  generateData(amount: number, options?: SeederOptions): IPurchaseHistory[] {
    const histories: IPurchaseHistory[] = [];

    if (!options?.orders || !options?.customers) throw new Error('Faltan los parámetros "orders" o "customers". \n Estos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.');

    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 9 });

      histories.push({
        id: i + 1,
        order_id: faker.number.int({ min: 1, max: options.orders }),
        customer_id: faker.number.int({ min: 1, max: options.customers }),
        snapshot:{
            total: faker.number.float({ min: 10, max: 2000}),
            items: faker.number.int({ min: 1, max: 10 }),
            payment_status: faker.helpers.arrayElement(['paid', 'pending', 'refunded']),
          } as unknown as JSON,
        created_at: createdAt
      });
    }

    return histories;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);
    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos del historial de compras');

    const values = records.flatMap(r => [
      r.order_id,
      r.customer_id,
      JSON.stringify(r.snapshot),
      toMySQLDateTime(r.created_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PURCHASE_HISTORY (
        order_id,
        customer_id,
        snapshot,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en PURCHASE_HISTORY:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.order_id}"`,
        `"${r.customer_id}"`,
        `"${JSON.stringify(r.snapshot)}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns = 'id,order_id,customer_id,snapshot,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/PurchaseHistory.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de PurchaseHistory:', error);
      throw error;
    }
  }
}
