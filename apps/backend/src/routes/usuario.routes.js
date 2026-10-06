import { Router } from 'express';
import { getUsuarios, createUsuario } from '../controllers/usuario.controller.js';
const router = Router();

// Cuando alguien entre por GET a la ruta principal, ejecuta getUsuarios
router.get('/', getUsuarios);
router.post('/', createUsuario);

export default router;