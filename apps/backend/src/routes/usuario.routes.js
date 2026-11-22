import { Router } from "express";
import {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
} from "../controllers/usuario.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/autorizarRoles.js";
import { registrarAuditoria } from "../middlewares/auditoria.js";

const router = Router();
const SOLO_ADMIN = autorizarRoles("admin", "administrador");

router.get("/", verificarToken, SOLO_ADMIN, getUsuarios);
router.get("/:id", verificarToken, SOLO_ADMIN, getUsuarioById);
router.post("/", verificarToken, SOLO_ADMIN, registrarAuditoria("Usuarios"), createUsuario);
router.put("/:id", verificarToken, SOLO_ADMIN, registrarAuditoria("Usuarios"), updateUsuario);
router.delete("/:id", verificarToken, SOLO_ADMIN, registrarAuditoria("Usuarios"), deleteUsuario);

export default router;