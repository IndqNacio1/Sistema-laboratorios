import { Router } from 'express';
import { getInventario, createInventario } from '../controllers/inventario.controller.js';

const router = Router();

router.get('/', getInventario);
router.post('/', createInventario);

export default router;