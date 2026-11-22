import { Router } from "express";
import {
    crearSucursal,
    obtenerSucursales,
    obtenerSucursalPorId,
    actualizarSucursal,
    desactivarSucursal
} from "../controllers/sucursal.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();
const SOLO_ADMIN = autorizarRoles("admin", "administrador");

router.get("/", verificarToken, obtenerSucursales);
router.get("/:id", verificarToken, obtenerSucursalPorId);
router.post("/", verificarToken, SOLO_ADMIN, registrarAuditoria("Sucursales"), crearSucursal);
router.put("/:id", verificarToken, SOLO_ADMIN, registrarAuditoria("Sucursales"), actualizarSucursal);
router.delete("/:id", verificarToken, SOLO_ADMIN, registrarAuditoria("Sucursales"), desactivarSucursal);

export default router;