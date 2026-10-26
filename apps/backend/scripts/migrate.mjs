import pg from 'pg';
import { readFile, appendFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';
import { AppDataSource } from '../src/config/db.js';

const envFile = new URL('../.env', import.meta.url);
const options = AppDataSource.options;
const client = new pg.Client({
  host: options.host, port: options.port, user: options.username,
  password: options.password, database: options.database,
  connectionTimeoutMillis: 10000,
});

try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock(hashtext('laboratorio_migraciones'))");
  const installed = await client.query("SELECT to_regclass('laboratorio.schema_migrations') AS tabla");
  if (!installed.rows[0].tabla) {
    const legacy = await client.query("SELECT to_regclass('public.usuarios') AS tabla");
    if (!legacy.rows[0].tabla) {
      await client.query(await readFile(new URL('../database/001_base_actual.sql', import.meta.url), 'utf8'));
    }
    const sql = await readFile(new URL('../database/002_modelo_laboratorio.sql', import.meta.url), 'utf8');
    await client.query(sql);
    console.log('Modelo del laboratorio instalado y datos anteriores conservados.');
  } else {
    const version = await client.query("SELECT version FROM laboratorio.schema_migrations WHERE version = '002_modelo_laboratorio'");
    if (!version.rowCount) throw new Error('El esquema existe pero no tiene la version esperada. Revisalo antes de migrar.');
    console.log('Modelo del laboratorio ya instalado.');
  }
  const env = dotenv.parse(await readFile(envFile, 'utf8'));
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    await appendFile(envFile, `\nJWT_SECRET=${randomBytes(48).toString('hex')}\n`);
    console.log('Se configuro JWT_SECRET en el archivo local ignorado por Git.');
  }
} catch (error) {
  console.error(`No se pudo preparar la base: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
