import { AppDataSource } from '../config/db.js';
import { EstudioSchema } from '../entities/Estudio.js';

export const getEstudios = async (req, res) => {
    try {
        const estudioRepository = AppDataSource.getRepository(EstudioSchema);
        const estudios = await estudioRepository.find();
        res.json(estudios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los estudios" });
    }
};

export const createEstudio = async (req, res) => {
    try {
        const estudioRepository = AppDataSource.getRepository(EstudioSchema);
        const nuevoEstudio = estudioRepository.create(req.body);
        const resultado = await estudioRepository.save(nuevoEstudio);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el estudio" });
    }
};

export const subirResultadoEstudio = async (req, res, next) => {
  try {
    // Si multer funcionó, el archivo vendrá en req.file
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo PDF' });
    }
    
    // Aquí después guardarías la ruta req.file.path en tu base de datos ligada al Estudio
    res.status(200).json({
      success: true,
      message: 'Archivo subido correctamente',
      data: req.file
    });
  } catch (error) {
    next(error);
  }
};