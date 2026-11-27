import { Bitacora } from "../models/Bitacora.js";

export const registrarAuditoria = (modulo) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      const esEscritura = ["POST", "PUT", "DELETE"].includes(req.method);
      const esReporte = req.method === "GET" && modulo === "Reportes Financieros";

      if (res.statusCode >= 200 && res.statusCode < 300 && (esEscritura || esReporte)) {
        const detallesLimpios = req.body ? { ...req.body } : {};
        if (detallesLimpios.password) {
          detallesLimpios.password = "[PROTEGIDO]";
        }

        const nuevaEntrada = new Bitacora({
          accion: req.method,
          modulo,
          detalles: {
            usuario_id: req.user?.id || null,
            ruta: req.originalUrl,
            payload: detallesLimpios,
          },
        });
        nuevaEntrada.save().catch((err) => console.error("Error log:", err));
      }
      originalJson.call(this, data);
    };
    next();
  };
};