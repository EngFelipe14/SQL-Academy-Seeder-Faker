import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IShipmentItems } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryShipmentItems implements IRepoClass<IShipmentItems> {

  generateData(amount: number): IShipmentItems[] {
    const shipmentItems: IShipmentItems[] = [];

    for (let i = 0; i < amount; i++) {
      shipmentItems.push({
        id: faker.string.nanoid(),
        shipment_id: faker.number.int({ min: 1, max: 3000 }),
        order_item_id: faker.number.int({ min: 1, max: 5000 }),
        quantity: faker.number.int({ min: 1, max: 20 })
      });
    }

    return shipmentItems;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount);
    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos de shipment items');

    const values = records.flatMap(r => [
      r.id,
      r.shipment_id,
      r.order_item_id,
      r.quantity
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO SHIPMENT_ITEMS (
        id,
        shipment_id,
        order_item_id,
        quantity
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en SHIPMENT_ITEMS:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r).join(','))
      .join('\n');

    const columns = 'id,shipment_id,order_item_id,quantity\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/ShipmentItems.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de SHIPMENT_ITEMS:', error);
      throw error;
    }
  }
}
