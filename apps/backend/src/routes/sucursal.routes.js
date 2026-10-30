import { Router } from 'express';
import { getSucursales, getSucursal, createSucursal, updateSucursal } from '../controllers/sucursal.controller.js';

const router = Router();

router.get('/', getSucursales);
router.get('/:id', getSucursal);
router.post('/', createSucursal);
router.put('/:id', updateSucursal);

export default router;
