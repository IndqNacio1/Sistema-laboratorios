import { Router } from "express";
import { getVentas, createVenta } from "../controllers/venta.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("admin", "administrador", "recepcionista"), getVentas);
router.post("/", verificarToken, autorizarRoles("admin", "administrador", "recepcionista"), registrarAuditoria("Ventas"), createVenta);

export default router;