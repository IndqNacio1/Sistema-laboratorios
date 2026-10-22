import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/db.js';
import usuarioRoutes from './routes/usuario.routes.js';
import pacienteRoutes from './routes/paciente.routes.js';
import estudioRoutes from './routes/estudio.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/health', async (req, res) => {
  try {
    await AppDataSource.query('SELECT 1');
    res.json({ estatus: 'OK', baseDeDatos: 'conectada' });
  } catch {
    res.status(503).json({ estatus: 'ERROR', baseDeDatos: 'no disponible' });
  }
});
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/estudios', estudioRoutes);
app.use('/api/inventarios', inventarioRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/auth', authRoutes);

export default app;
