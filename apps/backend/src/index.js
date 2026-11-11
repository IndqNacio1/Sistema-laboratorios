import app from './app.js';
import { AppDataSource } from './config/db.js';

try {
  await AppDataSource.initialize();
  await AppDataSource.query('SELECT id FROM laboratorio.sucursales LIMIT 1');
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Backend conectado a PostgreSQL en puerto ${port}`));
} catch (error) {
  console.error(`No se pudo iniciar el backend: ${error.message}`);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exitCode = 1;
}
