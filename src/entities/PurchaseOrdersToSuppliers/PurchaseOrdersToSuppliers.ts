import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IPurchaseOrdersToSuppliers } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDate, toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryPurchaseOrdersToSuppliers implements IRepoClass<IPurchaseOrdersToSuppliers> {

  generateData(amount: number, options?: SeederOptions): IPurchaseOrdersToSuppliers[] {
    const orders: IPurchaseOrdersToSuppliers[] = [];

    if (!options?.suppliers) throw new Error('Falta el parámetro "suppliers". \n Este es necesario para generar los datos con IDs válidos y mantener la integridad referencial.');

    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 9 });
      const status = faker.helpers.arrayElement([
        'created',
        'sent',
        'received',
        'partially_received',
        'cancelled'
      ] as const);

      orders.push({
        id: i + 1,
        supplier_id: faker.number.int({ min: 1, max: options.suppliers }),
        po_number: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
        status,
        total_amount: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2}),
        expected_delivery_date:
          status === 'cancelled'
            ? null
            : faker.date.soon({ days: 60, refDate: createdAt}),
        created_at: createdAt
      });
    }

    return orders;
  }

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente las órdenes de compra a proveedores');

    const values = records.flatMap(r => [
      r.supplier_id,
      r.po_number,
      r.status,
      r.total_amount,
      r.expected_delivery_date === null ? null : toMySQLDate(r.expected_delivery_date),
      toMySQLDateTime(r.created_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PURCHASE_ORDERS_TO_SUPPLIERS (
        supplier_id,
        po_number,
        status,
        total_amount,
        expected_delivery_date,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando órdenes de compra a proveedores:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map(r => [
        `"${r.id}"`,
        `"${r.supplier_id}"`,
        `"${r.po_number}"`,
        `"${r.status}"`,
        `"${r.total_amount}"`,
        `"${r.expected_delivery_date ? toMySQLDateTime(r.expected_delivery_date) : ''}"`,
        `"${toMySQLDateTime(r.created_at)}"`
      ].join(','))
      .join('\n');

    const columns =
      'id,supplier_id,po_number,status,total_amount,expected_delivery_date,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/PurchaseOrdersToSuppliers.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de PurchaseOrdersToSuppliers:', error);
      throw error;
    }
  }
}
