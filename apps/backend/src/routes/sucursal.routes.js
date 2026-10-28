import { Router } from 'express';
import { AppDataSource } from '../config/db.js';
import { SucursalSchema } from '../entities/Laboratorio.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const branches = await AppDataSource.getRepository(SucursalSchema).find({
      select: { id: true, nombre: true, estatus: true }, order: { nombre: 'ASC' },
    });
    res.json(branches);
  } catch {
    res.status(500).json({ message: 'Error al obtener sucursales.' });
  }
});

export default router;
