import { Router } from "express";
import { getInventario, createInventario } from "../controllers/inventario.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();

router.get("/", verificarToken, getInventario);
router.post("/", verificarToken, autorizarRoles("admin", "administrador", "quimico"), registrarAuditoria("Inventario"), createInventario);

export default router;