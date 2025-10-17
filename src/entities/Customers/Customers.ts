import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import { faker} from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import type { ICustomers } from '../../models/interfaces/modelEntities.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toMySQLDateTime } from '../../utils/mysqlDateFormat.ts';

export class RepositoryCustomers implements IRepoClass<ICustomers> {

  generateData(amount: number): ICustomers[]  {
    const created = faker.date.past({ years: 10 });
    const customers: ICustomers[] = [];

    for (let i = 0; i < amount; i++) {
      customers.push({
        id: i + 1,
        email: faker.internet.email(),
        password_hash: faker.string.alphanumeric(15),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        phone: faker.phone.number({ style: 'human' }),
        is_active: faker.datatype.boolean({ probability: 0.5 }),
        created_at: created,
        updated_at: faker.date.between({ from: created, to: new Date() }),
      });
      
    }
    return customers;
  }
  
  async insertData (amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<ICustomers, 'id'>> = this.generateData(amount).map(({id, ...rest}) => rest);

    if (records.length !== amount) throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.email,
      r.password_hash,
      r.first_name,
      r.last_name,
      r.phone,
      r.is_active,
      toMySQLDateTime(r.created_at),
      toMySQLDateTime(r.updated_at)
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `INSERT INTO CUSTOMERS (
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    is_active,
    created_at,
    updated_at)
    VALUES ${placeholders}`;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];

    } catch (error) {
      throw error;
    }
  }

  async generateCSV (amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => [
        `"${r.id}"`,
        `"${r.email}"`,
        `"${r.password_hash}"`,
        `"${r.first_name}"`,
        `"${r.last_name}"`,
        `"${r.phone}"`,
        `"${r.is_active}"`,
        `"${toMySQLDateTime(r.created_at)}"`,
        `"${toMySQLDateTime(r.updated_at)}"`
      ].join(','))
      .join('\n');

    const columnsName = 'id,email,password_hash,first_name,last_name,phone,is_active,created_at,updated_at\n';
    const completeInformation = columnsName + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Customers.csv');

    try {
      await fs.writeFile(filePath, completeInformation, 'utf-8');
    } catch (error) {
      console.error('Error creando CSV de Customers:', error);
      throw error;
    }
  }
}