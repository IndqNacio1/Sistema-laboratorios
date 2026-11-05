import { AppDataSource } from '../config/db.js';
import { UsuarioSchema, PacienteSchema, ServicioSchema, SucursalSchema, EstudioPacienteSchema } from '../entities/Laboratorio.js';

const roles = ['administrador', 'operativo', 'recepcion'];
const readRoles = [...roles, 'supervisor'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (status, message) => Object.assign(new Error(message), { status });
const activeBranch = (branch) => branch?.estatus === 'activo' && (!branch.expiresAt || new Date(branch.expiresAt) > new Date());

export async function getSolicitudOptions(req, res) {
  if (!roles.includes(req.user.rol)) return res.status(403).json({ message: 'No tienes permiso para registrar solicitudes.' });
  try {
    const branch = await AppDataSource.getRepository(SucursalSchema).findOneBy({ id: req.user.sucursalId });
    if (!activeBranch(branch)) return res.status(403).json({ message: 'Tu sucursal no esta activa.' });
    const [patients, services, branches] = await Promise.all([
      AppDataSource.getRepository(PacienteSchema).find({ where: {
        estatus: 'activo', ...(req.user.rol === 'administrador' ? {} : { sucursalId: req.user.sucursalId }),
      }, order: { apellidos: 'ASC', nombre: 'ASC' } }),
      AppDataSource.getRepository(ServicioSchema).find({ where: { estatus: 'activo' }, order: { nombre: 'ASC' } }),
      AppDataSource.getRepository(SucursalSchema).find(),
    ]);
    const active = new Set(branches.filter(activeBranch).map((item) => item.id));
    res.json({ patients: patients.filter((patient) => active.has(patient.sucursalId)), services,
      usuario: { id: req.user.id, nombre: req.user.nombre, rol: req.user.rol, sucursalId: branch.id, sucursalNombre: branch.nombre } });
  } catch {
    res.status(500).json({ message: 'No se pudieron cargar las opciones de solicitud.' });
  }
}

export async function createSolicitud(req, res) {
  if (!roles.includes(req.user.rol)) return res.status(403).json({ message: 'No tienes permiso para registrar solicitudes.' });
  const { pacienteId, servicioId } = req.body || {};
  if (typeof pacienteId !== 'string' || typeof servicioId !== 'string' || !uuid.test(pacienteId) || !uuid.test(servicioId)) {
    return res.status(400).json({ message: 'Selecciona un paciente y un servicio validos.' });
  }
  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const user = await manager.getRepository(UsuarioSchema).findOne({ where: { id: req.user.id }, lock: { mode: 'pessimistic_read' } });
      if (!user || user.estatus !== 'activo' || !roles.includes(user.rol)) throw fail(403, 'La cuenta no puede registrar solicitudes.');
      const patient = await manager.getRepository(PacienteSchema).findOne({ where: { id: pacienteId }, lock: { mode: 'pessimistic_read' } });
      if (!patient) throw fail(404, 'Paciente no encontrado.');
      if (patient.estatus !== 'activo') throw fail(400, 'El paciente esta inactivo.');
      if (user.rol !== 'administrador' && patient.sucursalId !== user.sucursalId) throw fail(403, 'El paciente pertenece a otra sucursal.');
      for (const id of [...new Set([user.sucursalId, patient.sucursalId])].sort()) {
        const branch = await manager.getRepository(SucursalSchema).findOne({ where: { id }, lock: { mode: 'pessimistic_read' } });
        if (!activeBranch(branch)) throw fail(403, 'La sucursal no esta activa o ha expirado.');
      }
      const service = await manager.getRepository(ServicioSchema).findOne({ where: { id: servicioId }, lock: { mode: 'pessimistic_read' } });
      if (!service) throw fail(404, 'Servicio no encontrado.');
      if (service.estatus !== 'activo') throw fail(400, 'El servicio esta inactivo.');
      const studies = manager.getRepository(EstudioPacienteSchema);
      return studies.save(studies.create({ pacienteId, servicioId, usuarioId: user.id, estado: 'pendiente' }));
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo registrar la solicitud.' });
  }
}

export async function getSolicitud(req, res) {
  if (!readRoles.includes(req.user.rol)) return res.status(403).json({ message: 'No tienes permiso para consultar solicitudes.' });
  if (!uuid.test(req.params.id)) return res.status(400).json({ message: 'El identificador no es valido.' });
  try {
    const study = await AppDataSource.getRepository(EstudioPacienteSchema).findOneBy({ id: req.params.id });
    if (!study) return res.status(404).json({ message: 'Solicitud no encontrada.' });
    const patient = await AppDataSource.getRepository(PacienteSchema).findOneBy({ id: study.pacienteId });
    if (req.user.rol !== 'administrador' && patient?.sucursalId !== req.user.sucursalId) return res.status(403).json({ message: 'La solicitud pertenece a otra sucursal.' });
    const branch = await AppDataSource.getRepository(SucursalSchema).findOneBy({ id: req.user.sucursalId });
    if (!activeBranch(branch)) return res.status(403).json({ message: 'Tu sucursal no esta activa.' });
    res.json(study);
  } catch {
    res.status(500).json({ message: 'No se pudo consultar la solicitud.' });
  }
}
