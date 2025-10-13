import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IPurchaseOrdersToSuppliers } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryPurchaseOrdersToSuppliers implements IRepoClass<IPurchaseOrdersToSuppliers> {

  generateData(amount: number): IPurchaseOrdersToSuppliers[] {
    const orders: IPurchaseOrdersToSuppliers[] = [];

    for (let i = 0; i < amount; i++) {
      const createdAt = faker.date.past({ years: 2 });
      const status = faker.helpers.arrayElement([
        'created',
        'send',
        'received',
        'partially_received',
        'cancelled'
      ] as const);

      orders.push({
        id: faker.string.nanoid(),
        supplier_id: faker.number.int({ min: 1, max: 200 }),
        po_number: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
        status,
        total_amount: faker.number.float({ min: 1000, max: 100000}),
        expected_delivery_date:
          status === 'cancelled'
            ? null
            : faker.date.soon({ days: 60, refDate: createdAt }),
        created_at: createdAt
      });
    }

    return orders;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente las órdenes de compra a proveedores');

    const values = records.flatMap(r => [
      r.id,
      r.supplier_id,
      r.po_number,
      r.status,
      r.total_amount,
      r.expected_delivery_date,
      r.created_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PURCHASE_ORDERS_TO_SUPPLIERS (
        id,
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

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r =>
        Object.values(r).map(v => (v instanceof Date ? v.toISOString() : v ?? '')).join(',')
      )
      .join('\n');

    const columns =
      'id,supplier_id,po_number,status,total_amount,expected_delivery_date,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/PurchaseOrdersToSuppliers.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de órdenes de compra a proveedores:', error);
      throw error;
    }
  }
}
