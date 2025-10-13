import type { IRepoClass } from '../../models/contrats/IRepoClass.ts';
import type { ISuppliers } from '../../models/interfaces/modelEntities.ts';
import { faker } from '@faker-js/faker';
import { connectionDB as conn } from '../../config/connectionDB/connectionDB.ts';
import type { FieldPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export class RepositorySuppliers implements IRepoClass<ISuppliers> {

  generateData(amount: number): ISuppliers[] {
    const suppliers: ISuppliers[] = [];

    for (let i = 0; i < amount; i++) {
      const created = faker.date.past({ years: 10 });

      suppliers.push({
        id: faker.string.nanoid(),
        name: faker.company.name(),
        contact_name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'human' }),
        address: faker.location.streetAddress(),
        created_at: created
      });
    }

    return suppliers;
  }

  async insertData(amount: number): Promise<[ResultSetHeader, FieldPacket[]] | void> {
    const records: Array<Omit<ISuppliers, 'id'>> = this.generateData(amount).map(({ id, ...rest }) => rest);

    if (records.length !== amount)
      throw new Error('No se generaron correctamente los datos con faker');

    const values = records.flatMap(r => [
      r.name,
      r.contact_name,
      r.email,
      r.phone,
      r.address,
      r.created_at
    ]);

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
      INSERT INTO SUPPLIERS (
        name,
        contact_name,
        email,
        phone,
        address,
        created_at
      )
      VALUES ${placeholders}
    `;

    try {
      const [result, fields] = await conn.execute<ResultSetHeader>(query, values);
      return [result, fields];
    } catch (error) {
      console.error('Error insertando proveedores:', error);
      throw error;
    }
  }

  async generateCSV(amount: number): Promise<void> {
    const data = this.generateData(amount)
      .map(r => Object.values(r))
      .map(r => r.join(','))
      .join('\n');

    const columns = 'id,name,contact_name,email,phone,address,created_at\n';
    const completeData = columns + data;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../CSV/Suppliers.csv');

    try {
      await fs.writeFile(filePath, completeData, 'utf-8');
      console.log('Documento CSV creado en:', filePath);
    } catch (error) {
      console.error('Error creando CSV de proveedores:', error);
      throw error;
    }
  }
}
