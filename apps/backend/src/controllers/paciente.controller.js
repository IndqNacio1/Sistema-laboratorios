import { AppDataSource } from '../config/db.js';
import { PacienteSchema } from '../entities/Paciente.js';

export const getPacientes = async (req, res, next) => {
  try {
    // Paginación: Lee de la URL qué página quieres y cuántos registros (por defecto página 1, 10 registros)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pacienteRepository = AppDataSource.getRepository(PacienteSchema);
    
    // findAndCount trae solo los registros de esa página y el total global
    const [pacientes, total] = await pacienteRepository.findAndCount({
      skip: skip,
      take: limit,
      order: { id: 'DESC' } // Trae los más recientes primero
    });

    const totalPages = Math.ceil(total / limit);

    // Respuesta estructurada con los datos y la información de la página
    res.status(200).json({
      success: true,
      data: pacientes,
      meta: {
        totalItems: total,
        itemCount: pacientes.length,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
      }
    });
  } catch (error) {
    next(error); // Manda el error al errorHandler global que configuramos antes
  }
};

export const createPaciente = async (req, res, next) => {
  try {
    const pacienteRepository = AppDataSource.getRepository(PacienteSchema);
    // req.body toma todos los datos que mandes desde Postman
    const nuevoPaciente = pacienteRepository.create(req.body);
    const resultado = await pacienteRepository.save(nuevoPaciente);
    res.status(201).json(resultado);
  } catch (error) {
    next(error); // Manda el error al errorHandler global
  }
};