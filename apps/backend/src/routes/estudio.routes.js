import { Router } from 'express';
import { getEstudios, createEstudio, getServicio, updateServicio } from '../controllers/estudio.controller.js';

const router = Router();

router.get('/', getEstudios);
router.post('/', createEstudio );
router.get('/:id', getServicio);
router.put('/:id', updateServicio);

export default router;
