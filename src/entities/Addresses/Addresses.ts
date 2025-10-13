import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { IAddresses } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositoryAddresses implements IRepoClass<IAddresses> {

  generateData(amount: number): IAddresses[] {
    const addresses: IAddresses[] = [];

    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 10 });
        addresses.push({
        id: faker.string.nanoid(),
        customer_id: faker.number.int({ min: 1, max: 1000 }), // simula clientes existentes
        country: faker.location.country(),
        state: faker.location.state(),
        city: faker.location.city(),
        street: faker.location.streetAddress(),
        label: faker.helpers.arrayElement(['Casa', 'Oficina', 'Apartamento', 'Otro']),
        postal_code: faker.location.zipCode(),
        is_default_shipping: faker.datatype.boolean({ probability: 0.3 }),
        is_default_billing: faker.datatype.boolean({ probability: 0.3 }),
        created_at: created
      });
    }

    return addresses;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<IAddresses, 'id'>> = this.generateData(amount).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.customer_id,
      r.country,
      r.state,
      r.city,
      r.street,
      r.label,
      r.postal_code,
      r.is_default_shipping,
      r.is_default_billing,
      r.created_at
    ]);

    const placeholders = records.map(() =>
      '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).join(', ');

    const query = `
      INSERT INTO ADDRESSES (
        customer_id,
        country,
        state,
        city,
        street,
        label,
        postal_code,
        is_default_shipping,
        is_default_billing,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando direcciones:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns = 'id,customer_id,country,state,city,street,label,postal_code,is_default_shipping,is_default_billing,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Addresses.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de direcciones:', error);
      throw error;
    }
  }
}
