import { AppDataSource } from '../config/db.js';
import { InventarioSchema } from '../entities/Inventario.js';

export const getInventario = async (req, res, next) => {
  try {
    const inventarioRepository = AppDataSource.getRepository(InventarioSchema);
    const articulos = await inventarioRepository.find({
      order: { created_at: 'DESC' },
    });
    res.status(200).json({ success: true, data: articulos });
  } catch (error) {
    next(error);
  }
};

export const createInventario = async (req, res, next) => {
  try {
    const nombre = (req.body.nombre_item || req.body.articulo)?.trim();
    const { cantidad, unidad_medida, fecha_caducidad } = req.body;

    if (!nombre || cantidad === undefined || isNaN(Number(cantidad)) || Number(cantidad) < 0 || !unidad_medida?.trim()) {
      return res.status(400).json({
        error: 'Los campos nombre_item, cantidad (>= 0) y unidad_medida son obligatorios.',
      });
    }

    const inventarioRepository = AppDataSource.getRepository(InventarioSchema);
    const nuevoArticulo = inventarioRepository.create({
      nombre_item: nombre,
      cantidad: parseInt(cantidad, 10),
      unidad_medida: unidad_medida.trim(),
      fecha_caducidad: fecha_caducidad || null,
    });

    const resultado = await inventarioRepository.save(nuevoArticulo);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};