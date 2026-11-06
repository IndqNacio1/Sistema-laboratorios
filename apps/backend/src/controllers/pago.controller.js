import { AppDataSource } from "../config/db.js";
// Ajusta la ruta de importación según cómo nombraste tu archivo de entidad
import { PagoSchema } from "../entities/Pago.js"; 

export const crearPago = async (req, res) => {
    try {
        const { estudio_id, monto, metodo_pago } = req.body;

        // Reglas de validación financieras
        if (!estudio_id || !monto || !metodo_pago) {
            return res.status(400).json({ error: "Faltan datos obligatorios para procesar el cobro." });
        }
        if (monto <= 0) {
            return res.status(400).json({ error: "El monto del pago debe ser mayor a cero." });
        }

        const pagoRepository = AppDataSource.getRepository(PagoSchema);
        
        const nuevoPago = pagoRepository.create({ estudio_id, monto, metodo_pago });
        const resultado = await pagoRepository.save(nuevoPago);

        res.status(201).json({ mensaje: "Pago registrado con éxito", datos: resultado });
    } catch (error) {
        console.error("Error al registrar pago:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar el pago." });
    }
};

export const obtenerPagos = async (req, res) => {
    try {
        const pagoRepository = AppDataSource.getRepository(PagoSchema);
        const pagos = await pagoRepository.find();
        
        res.status(200).json(pagos);
    } catch (error) {
        console.error("Error al obtener pagos:", error);
        res.status(500).json({ error: "Error interno al consultar el historial de pagos." });
    }
};