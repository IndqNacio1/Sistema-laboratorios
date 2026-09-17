import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/health', healthRoutes);

export default app;
