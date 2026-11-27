import { ILike } from 'typeorm';
import { AppDataSource } from '../config/db.js';
import { PacienteSchema } from '../entities/Paciente.js';

export const getPacientes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    const pacienteRepository = AppDataSource.getRepository(PacienteSchema);

    const where = search
      ? [
          { nombre: ILike(`%${search}%`) },
          { apellidos: ILike(`%${search}%`) },
          { telefono: ILike(`%${search}%`) },
        ]
      : {};

    const [pacientes, total] = await pacienteRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    res.status(200).json({
      success: true,
      data: pacientes,
      meta: {
        totalItems: total,
        itemCount: pacientes.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPacienteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pacienteRepository = AppDataSource.getRepository(PacienteSchema);
    const paciente = await pacienteRepository.findOneBy({ id });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    res.status(200).json({ success: true, data: paciente });
  } catch (error) {
    next(error);
  }
};

export const createPaciente = async (req, res, next) => {
  try {
    const { nombre, apellidos, fecha_nacimiento, telefono } = req.body;

    if (!nombre?.trim() || !apellidos?.trim()) {
      return res.status(400).json({
        error: 'Los campos nombre y apellidos son obligatorios.',
      });
    }

    const pacienteRepository = AppDataSource.getRepository(PacienteSchema);
    const nuevoPaciente = pacienteRepository.create({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      fecha_nacimiento: fecha_nacimiento || null,
      telefono: telefono?.trim() || null,
    });

    const resultado = await pacienteRepository.save(nuevoPaciente);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const updatePaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, telefono } = req.body;

    const pacienteRepository = AppDataSource.getRepository(PacienteSchema);
    const paciente = await pacienteRepository.findOneBy({ id });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    if (fecha_nacimiento !== undefined) paciente.fecha_nacimiento = fecha_nacimiento || null;
    if (nombre !== undefined) paciente.nombre = nombre.trim();
    if (apellidos !== undefined) paciente.apellidos = apellidos.trim();
    if (telefono !== undefined) paciente.telefono = telefono ? telefono.trim() : null;

    const actualizado = await pacienteRepository.save(paciente);
    res.status(200).json({
      mensaje: 'Paciente actualizado con éxito',
      data: actualizado,
    });
  } catch (error) {
    next(error);
  }
};