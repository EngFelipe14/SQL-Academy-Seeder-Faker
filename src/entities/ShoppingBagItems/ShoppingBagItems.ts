import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IShoppingBagItems } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryShoppingBagItems implements IRepoClass<IShoppingBagItems> {

  generateData(amount: number): IShoppingBagItems[] {
    const items: IShoppingBagItems[] = [];

    for (let i = 0; i < amount; i++) {
      items.push({
        id: faker.string.nanoid(),
        shopping_bag_id: faker.number.int({ min: 1, max: 3000 }),
        product_variant_id: faker.number.int({ min: 1, max: 2000 }),
        quantity: faker.number.int({ min: 1, max: 10 }),
        unit_price_snapshot: faker.number.float({ min: 5, max: 500}),
        added_at: faker.date.recent({ days: 30 })
      });
    }

    return items;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los ítems del carrito');

    const values = records.flatMap(r => [
      r.id,
      r.shopping_bag_id,
      r.product_variant_id,
      r.quantity,
      r.unit_price_snapshot,
      r.added_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO SHOPPING_BAG_ITEMS (
        id,
        shopping_bag_id,
        product_variant_id,
        quantity,
        unit_price_snapshot,
        added_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en SHOPPING_BAG_ITEMS:', error);
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
      'id,shopping_bag_id,product_variant_id,quantity,unit_price_snapshot,added_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ShoppingBagItems.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de SHOPPING_BAG_ITEMS:', error);
      throw error;
    }
  }
}
