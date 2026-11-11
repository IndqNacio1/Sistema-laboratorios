import { AppDataSource } from '../config/db.js';
import { ServicioSchema } from '../entities/Laboratorio.js';

const repository = () => AppDataSource.getRepository(ServicioSchema);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseService(body, current = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Los datos del servicio no son validos.' };
  if (typeof body.nombre !== 'string' || !body.nombre.trim() || body.nombre.trim().length > 150) {
    return { error: 'El nombre es obligatorio y admite hasta 150 caracteres.' };
  }
  const value = body.precio;
  if (!['string', 'number'].includes(typeof value) || !/^\d{1,10}(\.\d{1,2})?$/.test(String(value))) {
    return { error: 'El costo debe estar entre 0 y 9999999999.99, con un maximo de dos decimales.' };
  }
  const description = body.descripcion === undefined ? current.descripcion ?? null : body.descripcion;
  if (description !== null && (typeof description !== 'string' || description.trim().length > 2000)) {
    return { error: 'La descripcion admite hasta 2000 caracteres.' };
  }
  const estatus = body.estatus === undefined ? current.estatus ?? 'activo' : body.estatus;
  if (!['activo', 'inactivo'].includes(estatus)) return { error: 'El estado no es valido.' };
  const [integer, fraction = ''] = String(value).split('.');
  return { data: {
    nombre: body.nombre.trim(), precio: `${BigInt(integer)}.${fraction.padEnd(2, '0')}`,
    descripcion: typeof description === 'string' ? description.trim() || null : null, estatus,
  } };
}

export async function getServicios(req, res) {
  if (req.query.estatus && !['activo', 'inactivo'].includes(req.query.estatus)) return res.status(400).json({ message: 'El estado no es valido.' });
  try {
    res.json(await repository().find({
      where: req.query.estatus ? { estatus: req.query.estatus } : {}, order: { nombre: 'ASC', id: 'ASC' },
    }));
  } catch {
    res.status(500).json({ message: 'Error al obtener servicios.' });
  }
}

export async function getServicio(req, res) {
  if (!uuid.test(req.params.id)) return res.status(400).json({ message: 'El identificador no es valido.' });
  try {
    const service = await repository().findOneBy({ id: req.params.id });
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado.' });
    res.json(service);
  } catch {
    res.status(500).json({ message: 'Error al consultar el servicio.' });
  }
}

export async function createServicio(req, res) {
  try {
    const { data, error } = parseService(req.body);
    if (error) return res.status(400).json({ message: error });
    res.status(201).json(await repository().save(repository().create(data)));
  } catch {
    res.status(500).json({ message: 'Error al registrar el servicio.' });
  }
}

export async function updateServicio(req, res) {
  if (!uuid.test(req.params.id)) return res.status(400).json({ message: 'El identificador no es valido.' });
  try {
    const current = await repository().findOneBy({ id: req.params.id });
    if (!current) return res.status(404).json({ message: 'Servicio no encontrado.' });
    const { data, error } = parseService(req.body, current);
    if (error) return res.status(400).json({ message: error });
    res.json(await repository().save(repository().merge(current, data)));
  } catch {
    res.status(500).json({ message: 'Error al actualizar el servicio.' });
  }
}
