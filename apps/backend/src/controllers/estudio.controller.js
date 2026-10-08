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