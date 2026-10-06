import { AppDataSource } from '../config/db.js';
import { PacienteSchema } from '../entities/Paciente.js';

export const getPacientes = async (req, res) => {
    try {
        const pacienteRepository = AppDataSource.getRepository(PacienteSchema);
        const pacientes = await pacienteRepository.find();
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener pacientes" });
    }
};

export const createPaciente = async (req, res) => {
    try {
        const pacienteRepository = AppDataSource.getRepository(PacienteSchema);
        // req.body toma todos los datos que mandes desde Postman
        const nuevoPaciente = pacienteRepository.create(req.body);
        const resultado = await pacienteRepository.save(nuevoPaciente);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al crear paciente" });
    }
};