import { Router } from "express";
import { obtenerResumenGeneral, obtenerBitacoraAuditoria } from "../controllers/reporte.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();

router.get("/resumen", verificarToken, autorizarRoles("admin", "administrador"), registrarAuditoria("Reportes Financieros"), obtenerResumenGeneral);
router.get("/auditoria", verificarToken, autorizarRoles("admin", "administrador"), obtenerBitacoraAuditoria);

export default router;
