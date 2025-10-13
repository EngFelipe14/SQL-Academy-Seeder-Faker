import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IWarehouses } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryWarehouses implements IRepoClass<IWarehouses> {

  generateData(amount: number): IWarehouses[] {
    const warehouses: IWarehouses[] = [];

    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 10 });

      warehouses.push({
        id: faker.string.nanoid(),
        name: faker.location.city(),
        country: faker.location.country(),
        city: faker.location.city(),
        street: faker.location.streetAddress(),
        phone: faker.phone.number({ style: 'human' }),
        created_at: created
      });
    }

    return warehouses;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<IWarehouses, 'id'>> = this.generateData(amount).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.name,
      r.country,
      r.city,
      r.street,
      r.phone,
      r.created_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO WAREHOUSES (
        name,
        country,
        city,
        street,
        phone,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando almacenes:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns = 'id,name,country,city,street,phone,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Warehouses.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de almacenes:', error);
      throw error;
    }
  }
}
