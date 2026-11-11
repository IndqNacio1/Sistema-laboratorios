import { AppDataSource } from '../config/db.js';
import { UsuarioSchema, SucursalSchema } from '../entities/Laboratorio.js';
import bcrypt from 'bcryptjs';

const roles = ['administrador', 'supervisor', 'operativo', 'recepcion'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const activeBranch = (branch) => branch?.estatus === 'activo' && (!branch.expiresAt || new Date(branch.expiresAt) > new Date());
const fail = (status, message) => Object.assign(new Error(message), { status });

export async function getRegistrationOptions(req, res) {
  if (req.user.rol !== 'administrador') return res.status(403).json({ message: 'Solo el administrador puede crear cuentas.' });
  try {
    const branches = await AppDataSource.getRepository(SucursalSchema).find({ order: { nombre: 'ASC' } });
    if (!activeBranch(branches.find((branch) => branch.id === req.user.sucursalId))) return res.status(403).json({ message: 'Tu sucursal no esta disponible.' });
    res.json({ sucursales: branches.filter(activeBranch).map(({ id, nombre }) => ({ id, nombre })), roles });
  } catch {
    res.status(503).json({ message: 'No se pudieron cargar las opciones de registro.' });
  }
}

export async function createUsuario(req, res) {
  if (req.user.rol !== 'administrador') return res.status(403).json({ message: 'Solo el administrador puede crear cuentas.' });
  const { nombre, apellidos = '', correo, password, rol = 'recepcion', sucursalId } = req.body || {};
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 100
    || typeof apellidos !== 'string' || apellidos.trim().length > 100
    || typeof correo !== 'string' || correo.trim().length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
    || typeof password !== 'string' || password.trim().length < 8 || Buffer.byteLength(password, 'utf8') > 72
    || !roles.includes(rol) || typeof sucursalId !== 'string' || !uuid.test(sucursalId)) {
    return res.status(400).json({ message: 'Revisa nombre, apellidos, correo, contrasena, rol y sucursal.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await AppDataSource.transaction(async (manager) => {
      const admin = await manager.getRepository(UsuarioSchema).findOne({ where: { id: req.user.id }, lock: { mode: 'pessimistic_read' } });
      if (!admin || admin.estatus !== 'activo' || admin.rol !== 'administrador') throw fail(403, 'La cuenta no puede crear usuarios.');
      for (const id of [...new Set([admin.sucursalId, sucursalId])].sort()) {
        const branch = await manager.getRepository(SucursalSchema).findOne({ where: { id }, lock: { mode: 'pessimistic_read' } });
        if (!activeBranch(branch)) throw fail(400, 'Selecciona una sucursal activa y vigente.');
      }
      const repo = manager.getRepository(UsuarioSchema);
      const user = await repo.save(repo.create({ nombre: nombre.trim(), apellidos: apellidos.trim(), correo: correo.trim().toLowerCase(),
        password: passwordHash, rol, sucursalId, estatus: 'activo' }));
      const { id, nombre: names, apellidos: surnames, correo: email, rol: role, sucursalId: branchId, estatus } = user;
      return { id, nombre: names, apellidos: surnames, correo: email, rol: role, sucursalId: branchId, estatus };
    });
    res.status(201).json(result);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'El correo ya esta registrado.' });
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear la cuenta.' });
  }
}

export async function getUsuarios(req, res) {
  if (!['administrador', 'supervisor'].includes(req.user.rol)) return res.status(403).json({ message: 'No tienes permiso para consultar usuarios.' });
  try {
    const branch = await AppDataSource.getRepository(SucursalSchema).findOneBy({ id: req.user.sucursalId });
    if (!activeBranch(branch)) return res.status(403).json({ message: 'Tu sucursal no esta disponible.' });
    res.json(await AppDataSource.getRepository(UsuarioSchema).find({
      where: req.user.rol === 'administrador' ? {} : { sucursalId: req.user.sucursalId }, order: { nombre: 'ASC' },
    }));
  } catch {
    res.status(500).json({ message: 'No se pudieron consultar los usuarios.' });
  }
}
