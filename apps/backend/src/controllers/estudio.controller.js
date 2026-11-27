import fs from 'fs';
import { AppDataSource } from '../config/db.js';
import { EstudioSchema } from '../entities/Estudio.js';

export const getEstudios = async (req, res, next) => {
  try {
    const estudioRepository = AppDataSource.getRepository(EstudioSchema);
    const estudios = await estudioRepository.find({
      order: { created_at: 'DESC' },
    });
    res.status(200).json({ success: true, data: estudios });
  } catch (error) {
    next(error);
  }
};

export const getEstudioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estudioRepository = AppDataSource.getRepository(EstudioSchema);
    const estudio = await estudioRepository.findOne({ where: { id } });

    if (!estudio) {
      return res.status(404).json({ error: 'Estudio no encontrado.' });
    }

    res.status(200).json({ success: true, data: estudio });
  } catch (error) {
    next(error);
  }
};

export const createEstudio = async (req, res, next) => {
  try {
    const { codigo, nombre, descripcion, precio } = req.body;

    if (!nombre?.trim() || precio === undefined || isNaN(Number(precio)) || Number(precio) < 0) {
      return res.status(400).json({
        error: 'Los campos nombre y precio (numérico >= 0) son obligatorios.',
      });
    }

    const estudioRepository = AppDataSource.getRepository(EstudioSchema);
    const nuevoEstudio = estudioRepository.create({
      codigo: codigo?.trim() || `EST-${Date.now()}`,
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precio: Number(precio),
      estatus: 'Pendiente',
    });

    const resultado = await estudioRepository.save(nuevoEstudio);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const subirResultadoEstudio = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo PDF' });
    }

    const estudioRepository = AppDataSource.getRepository(EstudioSchema);
    const estudio = await estudioRepository.findOne({ where: { id } });

    if (!estudio) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'El estudio indicado no existe' });
    }

    estudio.ruta_pdf = req.file.path;
    estudio.estatus = 'Completado';

    const actualizado = await estudioRepository.save(estudio);

    res.status(200).json({
      success: true,
      message: 'Archivo subido y vinculado correctamente al expediente',
      estudio: actualizado,
      archivo: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};