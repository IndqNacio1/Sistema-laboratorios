import { AppDataSource } from '../config/db.js';
import { UsuarioSchema, SucursalSchema } from '../entities/Laboratorio.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const activeBranch = (branch) => branch?.estatus === 'activo' && (!branch.expiresAt || new Date(branch.expiresAt) > new Date());

export async function login(req, res) {
  const { correo, password } = req.body || {};
  if (typeof correo !== 'string' || correo.trim().length > 100 || !correo.trim()
    || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Escribe un correo y una contrasena validos.' });
  }
  try {
    const usuario = await AppDataSource.getRepository(UsuarioSchema).createQueryBuilder('usuario')
      .addSelect('usuario.password').where('lower(usuario.correo) = lower(:correo)', { correo: correo.trim() }).getOne();
    if (!usuario || !await bcrypt.compare(password, usuario.password)) {
      return res.status(401).json({ message: 'Correo o contrasena incorrectos.' });
    }
    const branch = await AppDataSource.getRepository(SucursalSchema).findOneBy({ id: usuario.sucursalId });
    if (usuario.estatus !== 'activo' || !activeBranch(branch)) {
      return res.status(403).json({ message: 'Tu cuenta o sucursal no esta disponible. Contacta al administrador.' });
    }
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h', algorithm: 'HS256' });
    res.json({ mensaje: 'Login exitoso', token });
  } catch {
    res.status(500).json({ message: 'No se pudo iniciar sesion. Intenta nuevamente.' });
  }
}

export async function getSession(req, res) {
  try {
    const branch = await AppDataSource.getRepository(SucursalSchema).findOneBy({ id: req.user.sucursalId });
    if (!activeBranch(branch)) return res.status(403).json({ message: 'Tu sucursal no esta disponible.' });
    const { id, nombre, apellidos, correo, rol, sucursalId } = req.user;
    res.json({ id, nombre, apellidos, correo, rol, sucursalId, sucursalNombre: branch.nombre });
  } catch {
    res.status(503).json({ message: 'No se pudo consultar tu cuenta.' });
  }
}
