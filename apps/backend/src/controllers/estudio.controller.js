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
    const { id } = req.params; // Obtenemos el ID de la URL

    // Si multer funcionó, el archivo vendrá en req.file
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo PDF' });
    }
    
    const estudioRepository = AppDataSource.getRepository(EstudioSchema);
    
    // 1. Buscamos el estudio en la base de datos
    const estudio = await estudioRepository.findOne({ where: { id: id } });
    
    if (!estudio) {
      return res.status(404).json({ success: false, message: 'El estudio indicado no existe' });
    }

    // 2. Guardamos la ruta del archivo en el registro
    estudio.ruta_pdf = req.file.path; 
    
    // Opcional: Cambiar el estatus del estudio para indicar que ya tiene resultados
    estudio.estatus = 'Completado'; 

    // 3. Guardamos los cambios en PostgreSQL
    await estudioRepository.save(estudio);
    
    res.status(200).json({
      success: true,
      message: 'Archivo subido y vinculado correctamente al expediente',
      data: req.file
    });
  } catch (error) {
    next(error);
  }
};