import type { IRepoClass, SeederOptions } from '../../models/contrats/IRepoClass.ts';
import type { IAddresses } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryAddresses implements IRepoClass<IAddresses> {

  generateData(amount: number, options?: SeederOptions): IAddresses[] {
    const addresses: IAddresses[] = [];

    if (!options?.customers) throw new Error('Faltan el parámetro "customers". \n Este es necesario para generar los datos con IDs válidos y mantener la integridad referencial.');
    
    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 10 });
        addresses.push({
        id: i + 1,
        customer_id: faker.number.int({min: 1, max: options?.customers}),
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

  async insertData(amount: number, options?: SeederOptions): Promise<[ResultSetHeader, FieldPacket[]] | void> {
  

    const records: Array<Omit<IAddresses, 'id'>> = this.generateData(amount, options).map(({ id, ...rest }) => rest);

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
      toMySQLDateTime(r.created_at)
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

  async generateCSV(amount: number, options?: SeederOptions): Promise<void> {
    const data = this.generateData(amount, options)
  .map(r => [
    `"${r.id}"`,
    `"${r.customer_id}"`,
    `"${r.country}"`,
    `"${r.state}"`,
    `"${r.city}"`,
    `"${r.street}"`,
    `"${r.label}"`,
    `"${r.postal_code}"`,
    `"${r.is_default_shipping}"`,
    `"${r.is_default_billing}"`,
    `"${toMySQLDateTime(r.created_at)}"`].join(','))
  .join('\n');


    const columns = 'id,customer_id,country,state,city,street,label,postal_code,is_default_shipping,is_default_billing,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Addresses.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Addresses:', error);
      throw error;
    }
  }
}