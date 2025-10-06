
import config from "../envConfig/envConfig.ts";
import mysql, { PoolOptions, Pool } from 'mysql2';

const access: PoolOptions = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
}

export const connectionDB: Pool = mysql.createPool(access);
