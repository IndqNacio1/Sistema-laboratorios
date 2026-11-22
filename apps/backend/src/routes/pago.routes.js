import { Router } from "express";
import { crearPago, obtenerPagos } from "../controllers/pago.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();

router.post("/", verificarToken, autorizarRoles("admin", "administrador", "recepcionista"), registrarAuditoria("Pagos y Finanzas"), crearPago);
router.get("/", verificarToken, autorizarRoles("admin", "administrador", "recepcionista"), obtenerPagos);

export default router;