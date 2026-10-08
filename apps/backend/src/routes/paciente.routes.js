import { Router } from 'express';
import { getPacientes, createPaciente } from '../controllers/paciente.controller.js';

const router = Router();

router.get('/', getPacientes);
router.post('/', createPaciente);

export default router;