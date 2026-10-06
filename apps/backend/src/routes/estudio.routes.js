import { Router } from 'express';
import { getEstudios, createEstudio } from '../controllers/estudio.controller.js';

const router = Router();

router.get('/', getEstudios);
router.post('/', createEstudio );

export default router;