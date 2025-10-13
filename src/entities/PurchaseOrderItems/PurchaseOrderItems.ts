import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IPurchaseOrderItems } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryPurchaseOrderItems implements IRepoClass<IPurchaseOrderItems> {

  generateData(amount: number): IPurchaseOrderItems[] {
    const items: IPurchaseOrderItems[] = [];

    for (let i = 0; i < amount; i++) {
      const quantityOrdered = faker.number.int({ min: 1, max: 100 });
      const quantityReceived = faker.number.int({ min: 0, max: quantityOrdered });

      items.push({
        id: i + 1,
        purchase_order_id: faker.number.int({ min: 1, max: 500 }),
        product_variant_id: faker.number.int({ min: 1, max: 2000 }),
        quantity_ordered: quantityOrdered,
        quantity_received: quantityReceived,
        unit_cost: faker.number.float({ min: 5, max: 500})
      });
    }

    return items;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los items de orden de compra');

    const values = records.flatMap(r => [
      r.id,
      r.purchase_order_id,
      r.product_variant_id,
      r.quantity_ordered,
      r.quantity_received,
      r.unit_cost
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO PURCHASE_ORDER_ITEMS (
        id,
        purchase_order_id,
        product_variant_id,
        quantity_ordered,
        quantity_received,
        unit_cost
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando items de orden de compra:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns =
      'id,purchase_order_id,product_variant_id,quantity_ordered,quantity_received,unit_cost\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/PurchaseOrderItems.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de PURCHASE_ORDER_ITEMS:', error);
      throw error;
    }
  }
}