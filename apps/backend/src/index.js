import 'dotenv/config';
import app from './app.js';
import pool from './config/db.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor inicializado en el puerto ${PORT}`);
  
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`📦 Base de datos conectada exitosamente a las: ${res.rows[0].now}`);
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
  }
});