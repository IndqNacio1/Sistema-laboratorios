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
app.get('/api/health', (req, res) => {
  res.status(200).json({
    estatus: 'OK',
    mensaje: 'El servidor del laboratorio está corriendo perfectamente',
    tiempo: new Date()
  });
});

// Inicializar la conexión a la base de datos
AppDataSource.initialize()
    .then(() => {
        console.log("¡Conexión a la base de datos PostgreSQL exitosa!");
    })
    .catch((error) => {
        console.error("Error al conectar a la base de datos:", error);
    });

app.use(express.json()); // Permite recibir JSON (útil para cuando creemos usuarios)
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/estudios', estudioRoutes);
app.use('/api/inventarios', inventarioRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/auth', authRoutes);

export default app;