import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getSolicitudOptions, createSolicitud, getSolicitud, listSolicitudes } from '../controllers/solicitudEstudio.controller.js';

const router = Router();
router.use(authenticate);
router.get('/opciones', getSolicitudOptions);
router.get('/', listSolicitudes);
router.post('/', createSolicitud);
router.get('/:id', getSolicitud);
export default router;
