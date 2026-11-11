import { AppDataSource } from '../config/db.js';
import { PacienteSchema } from '../entities/Paciente.js';
import { SucursalSchema } from '../entities/Laboratorio.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const matrizId = '00000000-0000-4000-8000-000000000001';
const repository = () => AppDataSource.getRepository(PacienteSchema);

function parsePatient(body, current = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Datos de paciente no validos.' };
  const data = {};
  for (const field of ['nombre', 'apellidos']) {
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > 100) {
      return { error: 'Nombre y apellidos son obligatorios y admiten hasta 100 caracteres.' };
    }
    data[field] = body[field].trim();
  }
  for (const [field, limit] of [['telefono', 20], ['correo', 100], ['genero', 30]]) {
    const value = body[field] === undefined ? current[field] : body[field];
    if (value != null && (typeof value !== 'string' || value.trim().length > limit)) {
      return { error: `El campo ${field} no es valido.` };
    }
    data[field] = typeof value === 'string' ? value.trim() || null : null;
  }
  if (data.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) return { error: 'El correo no es valido.' };
  if (data.correo) data.correo = data.correo.toLowerCase();
  data.sucursalId = body.sucursalId === undefined ? current.sucursalId ?? matrizId : body.sucursalId;
  data.estatus = body.estatus === undefined ? current.estatus ?? 'activo' : body.estatus;
  if (typeof data.sucursalId !== 'string' || !uuid.test(data.sucursalId)) return { error: 'La sucursal no es valida.' };
  if (!['activo', 'inactivo'].includes(data.estatus)) return { error: 'El estado no es valido.' };
  data.fechaNacimiento = body.fechaNacimiento === undefined ? current.fechaNacimiento ?? null
    : body.fechaNacimiento === '' ? null : body.fechaNacimiento;
  if (data.fechaNacimiento !== null) {
    const value = data.fechaNacimiento;
    const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
    if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || date > new Date()) {
      return { error: 'La fecha de nacimiento debe ser valida y no puede estar en el futuro.' };
    }
  }
  return { data };
}

async function checkBranch(data, current) {
  const branch = await AppDataSource.getRepository(SucursalSchema).findOneBy({ id: data.sucursalId });
  if (!branch) return 'La sucursal no existe.';
  if (branch.estatus !== 'activo' && data.sucursalId !== current?.sucursalId) return 'La sucursal esta inactiva.';
  return null;
}

export async function getPacientes(req, res) {
  try {
    const { sucursalId, estatus } = req.query;
    if (sucursalId && (typeof sucursalId !== 'string' || !uuid.test(sucursalId))) return res.status(400).json({ message: 'La sucursal no es valida.' });
    if (estatus && !['activo', 'inactivo'].includes(estatus)) return res.status(400).json({ message: 'El estado no es valido.' });
    const pacientes = await repository().find({
      where: { ...(sucursalId ? { sucursalId } : {}), ...(estatus ? { estatus } : {}) },
      order: { apellidos: 'ASC', nombre: 'ASC', id: 'ASC' },
    });
    res.json(pacientes);
  } catch {
    res.status(500).json({ message: 'Error al obtener pacientes.' });
  }
}

export async function getPaciente(req, res) {
  if (!uuid.test(req.params.id)) return res.status(400).json({ message: 'El identificador no es valido.' });
  try {
    const patient = await repository().findOneBy({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado.' });
    res.json(patient);
  } catch {
    res.status(500).json({ message: 'Error al obtener el paciente.' });
  }
}

export async function createPaciente(req, res) {
  try {
    const { data, error } = parsePatient(req.body);
    if (error) return res.status(400).json({ message: error });
    const branchError = await checkBranch(data);
    if (branchError) return res.status(400).json({ message: branchError });
    res.status(201).json(await repository().save(repository().create(data)));
  } catch {
    res.status(500).json({ message: 'Error al crear paciente.' });
  }
}

export async function updatePaciente(req, res) {
  if (!uuid.test(req.params.id)) return res.status(400).json({ message: 'El identificador no es valido.' });
  try {
    const current = await repository().findOneBy({ id: req.params.id });
    if (!current) return res.status(404).json({ message: 'Paciente no encontrado.' });
    const { data, error } = parsePatient(req.body, current);
    if (error) return res.status(400).json({ message: error });
    const branchError = await checkBranch(data, current);
    if (branchError) return res.status(400).json({ message: branchError });
    res.json(await repository().save(repository().merge(current, data)));
  } catch {
    res.status(500).json({ message: 'Error al actualizar paciente.' });
  }
}
