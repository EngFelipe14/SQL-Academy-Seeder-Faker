import dotenv from 'dotenv';

dotenv.config();

interface Env {
  DB_PORT: number,
  DB_HOST: string,
  DB_PASSWORD: string,
  DB_USER: string,
  DB_NAME: string
};

const verifyEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Falta la variable de retorno: ${key}`);
  }

  return value;
};

const envConfig: Env = {
  DB_PORT: parseInt(verifyEnv('DB_PORT')),
  DB_HOST: verifyEnv('DB_HOST'), 
  DB_PASSWORD: verifyEnv('DB_PASSWORD'),
  DB_USER: verifyEnv('DB_USER'),
  DB_NAME: verifyEnv('DB_NAME')
}

export default envConfig;