import { AppDataSource } from '../config/db.js';
import { VentaSchema } from '../entities/Venta.js';

export const getVentas = async (req, res) => {
    try {
        const ventaRepository = AppDataSource.getRepository(VentaSchema);
        const ventas = await ventaRepository.find();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las ventas" });
    }
};

export const createVenta = async (req, res) => {
    try {
        const ventaRepository = AppDataSource.getRepository(VentaSchema);
        const nuevaVenta = ventaRepository.create(req.body);
        const resultado = await ventaRepository.save(nuevaVenta);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar la venta" });
    }
};