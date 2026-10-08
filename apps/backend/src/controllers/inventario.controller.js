import { AppDataSource } from '../config/db.js';
import { InventarioSchema } from '../entities/Inventario.js';

export const getInventario = async (req, res) => {
    try {
        const inventarioRepository = AppDataSource.getRepository(InventarioSchema);
        const articulos = await inventarioRepository.find();
        res.json(articulos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el inventario" });
    }
};

export const createInventario = async (req, res) => {
    try {
        const inventarioRepository = AppDataSource.getRepository(InventarioSchema);
        const nuevoArticulo = inventarioRepository.create(req.body);
        const resultado = await inventarioRepository.save(nuevoArticulo);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al agregar al inventario" });
    }
};