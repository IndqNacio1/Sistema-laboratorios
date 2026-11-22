import { Router } from "express";
import { getPacientes, createPaciente } from "../controllers/paciente.controller.js";
import { notificarResultadosListos } from "../services/email.service.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();

router.get("/", verificarToken, getPacientes);
router.post("/", verificarToken, autorizarRoles("admin", "administrador", "recepcionista"), registrarAuditoria("Pacientes"), createPaciente);

router.post("/notificar-prueba", verificarToken, autorizarRoles("admin", "administrador", "quimico", "recepcionista"), async (req, res, next) => {
    try {
        const { correo, nombre } = req.body;
        await notificarResultadosListos(correo, nombre);
        res.status(200).json({ success: true, message: "Correo de notificación enviado" });
    } catch (error) {
        next(error);
    }
});

export default router;