import { Router } from 'express';
import { getVentas, createVenta } from '../controllers/venta.controller.js';

const router = Router();

router.get('/', getVentas);
router.post('/', createVenta);

export default router;