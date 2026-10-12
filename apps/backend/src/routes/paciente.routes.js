import { Router } from 'express';
import { getPacientes, createPaciente } from '../controllers/paciente.controller.js';
import { notificarResultadosListos } from '../services/email.service.js';


const router = Router();

router.get('/', getPacientes);
router.post('/', createPaciente);

router.post('/notificar-prueba', async (req, res, next) => {
  try {
    // Puedes mandarle el correo y nombre desde el body en Postman
    const { correo, nombre } = req.body;
    await notificarResultadosListos(correo, nombre);
    
    res.status(200).json({ success: true, message: 'Correo de notificación enviado' });
  } catch (error) {
    next(error);
  }
});


export default router;