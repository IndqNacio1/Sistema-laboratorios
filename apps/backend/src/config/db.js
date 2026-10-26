import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { laboratorioEntities } from '../entities/Laboratorio.js';
import { VentaSchema } from '../entities/Venta.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'laboratorio_db',
  synchronize: false,
  logging: false,
  entities: [...laboratorioEntities, VentaSchema],
});
