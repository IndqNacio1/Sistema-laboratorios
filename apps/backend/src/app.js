import express from 'express';
import cors from 'cors';

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

export default app;