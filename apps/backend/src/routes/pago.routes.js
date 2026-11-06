import { Router } from "express";
import { crearPago, obtenerPagos } from "../controllers/pago.controller.js";
import { registrarAuditoria } from "../middlewares/auditoria.js"; // Tu log automático

const router = Router();

// Protegemos la creación de pagos para que quede en la bitácora NoSQL
router.post("/", registrarAuditoria("Pagos y Finanzas"), crearPago);
router.get("/", obtenerPagos);

export default router;