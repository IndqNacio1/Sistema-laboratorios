import { AppDataSource } from "../config/db.js";
import { PagoSchema } from "../entities/Pago.js";
import { EstudioSchema } from "../entities/Estudio.js";

export const crearPago = async (req, res, next) => {
  try {
    const { estudio_id, monto, metodo_pago } = req.body;

    if (!estudio_id || monto === undefined || !metodo_pago?.trim()) {
      return res.status(400).json({ error: "Faltan datos obligatorios para procesar el cobro." });
    }
    if (isNaN(Number(monto)) || Number(monto) <= 0) {
      return res.status(400).json({ error: "El monto del pago debe ser mayor a cero." });
    }

    const estudioRepository = AppDataSource.getRepository(EstudioSchema);
    const estudioExiste = await estudioRepository.findOne({ where: { id: estudio_id } });
    if (!estudioExiste) {
      return res.status(404).json({ error: "El estudio indicado no existe." });
    }

    const pagoRepository = AppDataSource.getRepository(PagoSchema);
    const nuevoPago = pagoRepository.create({
      estudio_id,
      monto: Number(monto),
      metodo_pago: metodo_pago.trim(),
    });
    const resultado = await pagoRepository.save(nuevoPago);

    res.status(201).json({ mensaje: "Pago registrado con éxito", datos: resultado });
  } catch (error) {
    next(error);
  }
};

export const obtenerPagos = async (req, res, next) => {
  try {
    const pagoRepository = AppDataSource.getRepository(PagoSchema);
    const pagos = await pagoRepository.find({
      order: { fecha_pago: "DESC" },
    });
    res.status(200).json({ success: true, data: pagos });
  } catch (error) {
    next(error);
  }
};