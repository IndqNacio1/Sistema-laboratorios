import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/db.js';
import { UsuarioSchema } from '../entities/Laboratorio.js';

export async function authenticate(req, res, next) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Inicia sesion para continuar.' });
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id)) throw new Error('Token no valido');
  } catch {
    return res.status(401).json({ message: 'La sesion no es valida o ha expirado.' });
  }
  try {
    const user = await AppDataSource.getRepository(UsuarioSchema).findOneBy({ id: payload.id });
    if (!user || user.estatus !== 'activo') return res.status(401).json({ message: 'La cuenta no esta disponible.' });
    req.user = user;
    next();
  } catch {
    res.status(503).json({ message: 'No se pudo verificar la sesion.' });
  }
}
