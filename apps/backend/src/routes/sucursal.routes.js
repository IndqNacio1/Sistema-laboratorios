import { Router } from "express";
import { crearSucursal, obtenerSucursales } from "../controllers/sucursal.controller.js";
import { registrarAuditoria } from "../middlewares/auditoria.js"; // <-- Importamos el interceptor

const router = Router();

// Le inyectamos el interceptor a la ruta de creación (POST)
// Le pasamos el nombre del módulo: "Sucursales"
router.post("/", registrarAuditoria("Sucursales"), crearSucursal);

// La ruta GET no necesita auditoría porque solo es lectura
router.get("/", obtenerSucursales);

export default router;