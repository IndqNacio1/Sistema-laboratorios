import { AppDataSource } from '../config/db.js';
import { VentaSchema } from '../entities/Venta.js';

export const getVentas = async (req, res, next) => {
  try {
    const ventaRepository = AppDataSource.getRepository(VentaSchema);
    const ventas = await ventaRepository.find({
      order: { created_at: 'DESC' },
    });
    res.status(200).json({ success: true, data: ventas });
  } catch (error) {
    next(error);
  }
};

export const createVenta = async (req, res, next) => {
  try {
    const { paciente_id, usuario_id, total, estado_pago } = req.body;

    if (total === undefined || isNaN(Number(total)) || Number(total) < 0) {
      return res.status(400).json({
        error: 'El campo total es obligatorio y debe ser un número mayor o igual a 0.',
      });
    }

    const ventaRepository = AppDataSource.getRepository(VentaSchema);
    const nuevaVenta = ventaRepository.create({
      paciente_id: paciente_id || null,
      usuario_id: usuario_id || req.user?.id || null,
      total: Number(total),
      estado_pago: estado_pago?.trim() || 'pagado',
    });

    const resultado = await ventaRepository.save(nuevaVenta);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};