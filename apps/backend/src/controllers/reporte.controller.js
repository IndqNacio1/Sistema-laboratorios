import { LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/db.js";
import { EstudioSchema } from "../entities/Estudio.js";
import { PagoSchema } from "../entities/Pago.js";
import { PacienteSchema } from "../entities/Paciente.js";
import { VentaSchema } from "../entities/Venta.js";
import { InventarioSchema } from "../entities/Inventario.js";
import { Bitacora } from "../models/Bitacora.js";

export const obtenerResumenGeneral = async (req, res, next) => {
  try {
    const estudioRepo = AppDataSource.getRepository(EstudioSchema);
    const pagoRepo = AppDataSource.getRepository(PagoSchema);
    const pacienteRepo = AppDataSource.getRepository(PacienteSchema);
    const ventaRepo = AppDataSource.getRepository(VentaSchema);
    const inventarioRepo = AppDataSource.getRepository(InventarioSchema);

    const [
      totalEstudios,
      estudiosPendientes,
      estudiosCompletados,
      pagosCompletados,
      totalPacientes,
      totalVentas,
      insumosStockBajo,
    ] = await Promise.all([
      estudioRepo.count(),
      estudioRepo.count({ where: { estatus: "Pendiente" } }),
      estudioRepo.count({ where: { estatus: "Completado" } }),
      pagoRepo.find({ where: { estatus: "Completado" } }),
      pacienteRepo.count(),
      ventaRepo.count(),
      inventarioRepo.find({ where: { cantidad: LessThanOrEqual(10) } }),
    ]);

    const ingresosTotales = pagosCompletados.reduce(
      (acumulador, pago) => acumulador + parseFloat(pago.monto || 0),
      0
    );

    res.status(200).json({
      success: true,
      fecha_generacion: new Date(),
      estadisticas: {
        total_pacientes: totalPacientes,
        total_estudios_realizados: totalEstudios,
        estudios_pendientes: estudiosPendientes,
        estudios_completados: estudiosCompletados,
        total_ventas_registradas: totalVentas,
        ingresos_totales_mxn: Number(ingresosTotales.toFixed(2)),
        alertas_stock_bajo: insumosStockBajo.length,
      },
      insumos_por_resurtir: insumosStockBajo,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerBitacoraAuditoria = async (req, res, next) => {
  try {
    const registros = await Bitacora.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, total: registros.length, data: registros });
  } catch (error) {
    next(error);
  }
};
