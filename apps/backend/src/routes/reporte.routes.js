import { Router } from "express";
import { obtenerResumenGeneral } from "../controllers/reporte.controller.js";
import { registrarAuditoria } from "../middlewares/auditoria.js"; 

const router = Router();

// El endpoint será GET /api/reportes/resumen
router.get("/resumen", registrarAuditoria("Reportes Financieros"), obtenerResumenGeneral);

export default router;