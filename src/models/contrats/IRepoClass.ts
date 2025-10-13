import type { ResultSetHeader, FieldPacket } from "mysql2";

export interface IRepoClass<T> {
  generateData: (amount: number) => Array<T>,
  insertData: (amount: number) => Promise<[ResultSetHeader, FieldPacket[]] | void>,
  generateCSV: (amount: number) => Promise<void>
}
