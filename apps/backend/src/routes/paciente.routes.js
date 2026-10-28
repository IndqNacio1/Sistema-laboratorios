import { Router } from 'express';
import { getPacientes, getPaciente, createPaciente, updatePaciente } from '../controllers/paciente.controller.js';

const router = Router();

router.get('/', getPacientes);
router.post('/', createPaciente);
router.get('/:id', getPaciente);
router.put('/:id', updatePaciente);

export default router;
