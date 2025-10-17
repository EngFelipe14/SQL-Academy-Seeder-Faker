import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IShipment } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryShipment implements IRepoClass<IShipment> {

  generateData(amount: number, options?: SeederOptions): IShipment[] {
    const shipments: IShipment[] = [];

    if (!options?.orders || !options?.warehouses)
      throw new Error(
        'Faltan los parámetros "orders" o "warehouses". \nEstos son necesarios para generar los datos con IDs válidos y mantener la integridad referencial.'
      );

    for (let i = 0; i < amount; i++) {
      const shipped_at: Date = faker.date.past({ years: 9 });

      shipments.push({
        id: i + 1,
        order_id: faker.number.int({ min: 1, max: options.orders }),
        shipment_number: faker.string.nanoid(),
        carrier: faker.helpers.arrayElement([ 'FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Logistics' ]),
        tracking_number: faker.string.alphanumeric({ length: 12 }),
        status: faker.helpers.arrayElement([ 'created', 'in_transit', 'delivered', 'returned' ]),
        from_warehouse_id: faker.number.int({ min: 1, max: options.warehouses }),
        shipped_at,
        delivered_at: faker.date.between({ from: shipped_at, to: new Date() }),
      });
    }

    return shipments;
  }

  async insertData( amount: number, options?: SeederOptions ): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records = this.generateData(amount, options).map(({id, ...rest}) => rest);

    const values = records.flatMap( r => [
        r.order_id,
        r.shipment_number,
        r.carrier,
        r.tracking_number,
        r.status,
        r.from_warehouse_id,
        toMySQLDateTime(r.shipped_at),
        toMySQLDateTime(r.delivered_at),
      ]
    );

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')

    const query = `
      INSERT INTO SHIPMENTS ( 
        order_id, 
        shipment_number, 
        carrier, 
        tracking_number, 
        status, 
        from_warehouse_id, 
        shipped_at, 
        delivered_at
      ) VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando datos en SHIPMENT_ITEMS:', error);
      throw error;
    }
  }

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
      .map((r) => [
        `"${r.id}"`,
        `"${r.order_id}"`,
        `"${r.shipment_number}"`,
        `"${r.carrier}"`,
        `"${r.tracking_number}"`,
        `"${r.status}"`,
        `"${r.from_warehouse_id}"`,
        `"${toMySQLDateTime(r.shipped_at)}"`,
        `"${toMySQLDateTime(r.delivered_at)}"`,
      ].join(','))
      .join('\n');

    const columns = 'id,order_id,shipment_number,carrier,tracking_number,status,from_warehouse_id,shipped_at,delivered_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Shipment.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Shipment:', error);
      throw error;
    }
  }
}
