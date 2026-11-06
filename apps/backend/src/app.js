import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit'; // Convertido a import
import { AppDataSource } from './config/db.js';
import usuarioRoutes from './routes/usuario.routes.js';
import pacienteRoutes from './routes/paciente.routes.js';
import estudioRoutes from './routes/estudio.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/errorHandler.js'; // Convertido a import y con extensión .js
import sucursalRoutes from "./routes/sucursal.routes.js";
import { conectarMongoDB } from "./config/mongo.js";
import { verificarToken } from "./middlewares/auth.middleware.js";
import pagoRoutes from "./routes/pago.routes.js";
import reporteRoutes from "./routes/reporte.routes.js";


const app = express();

// ==========================================
// 1. MIDDLEWARES GLOBALES
// ==========================================

// Configurar CORS
app.use(cors({
    origin: ["http://localhost:4200", "http://localhost:5173"], 
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

// Configurar Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.' }
});
app.use(apiLimiter);

// Permite recibir JSON
app.use(express.json());

// ==========================================
// 2. RUTAS
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    estatus: 'OK',
    mensaje: 'El servidor del laboratorio está corriendo perfectamente',
    tiempo: new Date()
  });
});

app.use("/api/auth", authRoutes); // Libre

app.use("/api/usuarios", verificarToken, usuarioRoutes);
app.use("/api/pacientes", verificarToken, pacienteRoutes);
app.use("/api/estudios", verificarToken, estudioRoutes);
app.use("/api/inventarios", verificarToken, inventarioRoutes);
app.use("/api/ventas", verificarToken, ventaRoutes);
app.use("/api/sucursales", verificarToken, sucursalRoutes);
app.use("/api/pagos", verificarToken, pagoRoutes);
app.use("/api/reportes", verificarToken, reporteRoutes);

// ==========================================
// 3. MANEJADOR DE ERRORES (Siempre al final de las rutas)
// ==========================================
app.use(errorHandler);

// ==========================================
// 4. INICIALIZACIÓN DE BASE DE DATOS
// ==========================================
AppDataSource.initialize()
    .then(() => {
        console.log("¡Conexión a la base de datos PostgreSQL exitosa!");
        // Conectar a MongoDB para logs
        conectarMongoDB();
    })
    .catch((error) => {
        console.error("Error al conectar a la base de datos:", error);
    });

export default app;