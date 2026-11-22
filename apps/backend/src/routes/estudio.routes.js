import { Router } from 'express';
import { getEstudios, createEstudio, subirResultadoEstudio } from '../controllers/estudio.controller.js';
import upload from '../middlewares/uploadHandler.js';

// 1. Importamos nuestros escudos de seguridad
import { verificarToken } from '../middlewares/auth.middleware.js'; // Ajusta la ruta si es diferente
import { autorizarRoles } from '../middlewares/autorizarRoles.js';

const router = Router();

// 2. Todos los que tengan sesión iniciada pueden consultar estudios
router.get('/', verificarToken, getEstudios);

// 3. Solo Recepción y Administración pueden cobrar/crear un estudio nuevo
router.post('/', verificarToken, autorizarRoles('Administrador', 'Recepcionista'), createEstudio);

// 4. Solo Químicos y Administración pueden subir resultados clínicos en PDF
// Nota: El orden importa. Primero verificamos quién es, luego su rol, y al final procesamos el PDF (upload.single)
router.post('/:id/upload', verificarToken, autorizarRoles('Administrador', 'Quimico'), upload.single('documento'), subirResultadoEstudio);

export default router;