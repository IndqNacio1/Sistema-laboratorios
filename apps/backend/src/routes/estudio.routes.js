import { Router } from "express";
import { getEstudios, createEstudio, subirResultadoEstudio } from "../controllers/estudio.controller.js";
import upload from "../middlewares/uploadHandler.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();

router.get("/", verificarToken, getEstudios);
router.post("/", verificarToken, autorizarRoles("admin", "administrador", "recepcionista"), registrarAuditoria("Estudios"), createEstudio);
router.post("/:id/upload", verificarToken, autorizarRoles("admin", "administrador", "quimico"), upload.single("documento"), registrarAuditoria("Resultados Clínicos"), subirResultadoEstudio);

export default router;