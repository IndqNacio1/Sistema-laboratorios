import { Router } from 'express';
import { getUsuarios, createUsuario, getRegistrationOptions } from '../controllers/usuario.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
const router = Router();
router.use(authenticate);
router.get('/opciones-registro', getRegistrationOptions);

// Cuando alguien entre por GET a la ruta principal, ejecuta getUsuarios
router.get('/', getUsuarios);
router.post('/', createUsuario);

export default router;
