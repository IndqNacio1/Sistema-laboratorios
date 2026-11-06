import { Bitacora } from "../models/Bitacora.js";

export const registrarAuditoria = (modulo) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
                const nuevaEntrada = new Bitacora({
                    accion: req.method,
                    modulo: modulo,
                    detalles: req.body
                });
                nuevaEntrada.save().catch(err => console.error("Error log:", err));
            }
            originalJson.call(this, data);
        };
        next();
    };
};