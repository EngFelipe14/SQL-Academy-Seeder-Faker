import config from "../envConfig/envConfig.ts";
import type { PoolOptions } from 'mysql2';
import mysql from "mysql2/promise"

const access: PoolOptions = {
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME
}

export const connectionDB = mysql.createPool(access);