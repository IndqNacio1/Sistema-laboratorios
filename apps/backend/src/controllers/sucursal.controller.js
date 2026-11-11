import { AppDataSource } from '../config/db.js';
import { SucursalSchema } from '../entities/Laboratorio.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const repository = () => AppDataSource.getRepository(SucursalSchema);

function parseBranch(body, current = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Los datos de la sucursal no son validos.' };
  for (const [field, limit] of [['nombre', 100], ['direccion', 500]]) {
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > limit) {
      return { error: `El campo ${field} es obligatorio y admite hasta ${limit} caracteres.` };
    }
  }
  const phone = body.telefono === undefined ? current.telefono ?? null : body.telefono;
  if (phone !== null && (typeof phone !== 'string' || phone.trim().length > 20)) return { error: 'El telefono no es valido.' };
  const telefono = typeof phone === 'string' ? phone.trim() || null : null;
  if (telefono && (!/^[+0-9 ().-]+$/.test(telefono) || !/^\d{7,15}$/.test(telefono.replace(/\D/g, '')))) {
    return { error: 'El telefono debe contener entre 7 y 15 digitos y solo signos de formato telefonico.' };
  }
  const estatus = body.estatus === undefined ? current.estatus ?? 'activo' : body.estatus;
  if (!['activo', 'inactivo'].includes(estatus)) return { error: 'El estado no es valido.' };
  return { data: { nombre: body.nombre.trim(), direccion: body.direccion.trim(), telefono, estatus } };
}

function saveError(res, error) {
  if (error.code === '23505') return res.status(409).json({ message: 'Ya existe una sucursal con ese nombre.' });
  return res.status(500).json({ message: 'No se pudo guardar la sucursal.' });
}

export async function getSucursales(req, res) {
  if (req.query.estatus && !['activo', 'inactivo'].includes(req.query.estatus)) return res.status(400).json({ message: 'El estado no es valido.' });
  try {
    res.json(await repository().find({ where: req.query.estatus ? { estatus: req.query.estatus } : {}, order: { nombre: 'ASC', id: 'ASC' } }));
  } catch {
    res.status(500).json({ message: 'Error al obtener sucursales.' });
  }
}

export async function getSucursal(req, res) {
  if (!uuid.test(req.params.id)) return res.status(400).json({ message: 'El identificador no es valido.' });
  try {
    const branch = await repository().findOneBy({ id: req.params.id });
    if (!branch) return res.status(404).json({ message: 'Sucursal no encontrada.' });
    res.json(branch);
  } catch {
    res.status(500).json({ message: 'Error al obtener la sucursal.' });
  }
}

export async function createSucursal(req, res) {
  try {
    const { data, error } = parseBranch(req.body);
    if (error) return res.status(400).json({ message: error });
    res.status(201).json(await repository().save(repository().create(data)));
  } catch (error) {
    saveError(res, error);
  }
}

export async function updateSucursal(req, res) {
  if (!uuid.test(req.params.id)) return res.status(400).json({ message: 'El identificador no es valido.' });
  try {
    const current = await repository().findOneBy({ id: req.params.id });
    if (!current) return res.status(404).json({ message: 'Sucursal no encontrada.' });
    const { data, error } = parseBranch(req.body, current);
    if (error) return res.status(400).json({ message: error });
    res.json(await repository().save(repository().merge(current, data)));
  } catch (error) {
    saveError(res, error);
  }
}
