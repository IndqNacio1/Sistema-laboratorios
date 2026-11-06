import { AppDataSource } from "../config/db.js";
import { EstudioSchema } from "../entities/Estudio.js";
import { PagoSchema } from "../entities/Pago.js";

export const obtenerResumenGeneral = async (req, res) => {
    try {
        const estudioRepository = AppDataSource.getRepository(EstudioSchema);
        const pagoRepository = AppDataSource.getRepository(PagoSchema);

        // 1. Contar cuántos estudios se han registrado en total
        const totalEstudios = await estudioRepository.count();

        // 2. Calcular los ingresos totales sumando los pagos completados
        const pagos = await pagoRepository.find({ where: { estatus: "Completado" } });
        const ingresosTotales = pagos.reduce((acumulador, pago) => acumulador + parseFloat(pago.monto), 0);

        // 3. Contar cuántos estudios están pendientes de resultados
        const estudiosPendientes = await estudioRepository.count({ where: { estatus: "Pendiente" } });

        res.status(200).json({
            fecha_generacion: new Date(),
            estadisticas: {
                total_estudios_realizados: totalEstudios,
                estudios_pendientes: estudiosPendientes,
                ingresos_totales_mxn: ingresosTotales
            }
        });
    } catch (error) {
        console.error("Error al generar el reporte:", error);
        res.status(500).json({ error: "Error interno al procesar las estadísticas." });
    }
};