import { EntitySchema } from 'typeorm';

const id = { type: 'uuid', primary: true, generated: 'uuid' };
const text = (length, nullable = false) => ({ type: 'varchar', length, nullable });
const uuid = (name, nullable = false) => ({ type: 'uuid', name, nullable });
const money = (name, nullable = false) => ({ type: 'numeric', precision: 12, scale: 2, name, nullable });
const quantity = (name) => ({ type: 'numeric', precision: 12, scale: 3, name });
const audit = {
  created_at: { type: 'timestamp', createDate: true },
  updated_at: { type: 'timestamp', updateDate: true },
};
const branch = { ...uuid('sucursal_id'), default: () => "'00000000-0000-4000-8000-000000000001'::uuid" };
const status = { ...text(10), default: 'activo' };
const person = {
  id, sucursalId: branch,
  nombre: { ...text(100), name: 'nombres' },
  apellidos: { ...text(100), default: '' },
  fechaNacimiento: { type: 'date', name: 'fecha_nacimiento', nullable: true },
  genero: text(30, true), estatus: status,
};
const entity = (name, tableName, columns) => new EntitySchema({
  name, schema: 'laboratorio', tableName, columns: { ...columns, ...audit },
});

export const SucursalSchema = entity('Sucursal', 'sucursales', {
  id, nombre: text(100), direccion: { type: 'text' }, telefono: text(20, true),
  estatus: status, expiresAt: { type: 'timestamp', name: 'expires_at', nullable: true },
});
export const UsuarioSchema = entity('Usuario', 'usuarios', {
  ...person, correo: text(100), password: { ...text(255), name: 'contrasena_hash', select: false },
  rol: { ...text(20), default: 'recepcion' },
});
export const PacienteSchema = entity('Paciente', 'pacientes', {
  ...person, telefono: text(20, true), correo: text(100, true),
});
export const ServicioSchema = entity('Servicio', 'servicios', {
  id, nombre: text(150), descripcion: { type: 'text', nullable: true },
  precio: money('costo'), estatus: status,
});
export const ProductoSchema = entity('Producto', 'productos', {
  id, articulo: { ...text(150), name: 'nombre' },
  codigoBarras: { ...text(100, true), name: 'codigo_barras' }, clave: text(100, true),
  unidad_medida: text(50), cantidad: quantity('stock'), stockMinimo: quantity('stock_minimo'),
  foto: { type: 'text', nullable: true }, estatus: status,
});
export const MaterialServicioSchema = entity('MaterialServicio', 'materiales_servicio', {
  id, servicioId: uuid('servicio_id'), productoId: uuid('producto_id'), cantidadRequerida: quantity('cantidad_requerida'),
});
export const EstudioPacienteSchema = entity('EstudioPaciente', 'estudios', {
  id, pacienteId: uuid('paciente_id'), servicioId: uuid('servicio_id'), usuarioId: uuid('usuario_id'),
  fecha: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }, resultado: { type: 'text', nullable: true },
  estado: { ...text(20), default: 'pendiente' },
});
export const MovimientoInventarioSchema = entity('MovimientoInventario', 'movimientos_inventario', {
  id, productoId: uuid('producto_id'), usuarioId: uuid('usuario_id'), tipo: text(10), cantidad: quantity('cantidad'),
  fecha: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }, motivo: { type: 'text' },
});
export const PagoSchema = entity('Pago', 'pagos', {
  id, estudioId: uuid('estudio_id'), usuarioId: uuid('usuario_id'), monto: money('monto'),
  montoRecibido: money('monto_recibido', true), cambioDevuelto: { ...money('cambio_devuelto'), default: 0 },
  metodoPago: { ...text(20), name: 'metodo_pago' }, estado: { ...text(10), default: 'pendiente' },
  fecha: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
});
export const CuentaSchema = entity('Cuenta', 'cuentas', {
  id, nombre: text(100), tipo: text(20), saldo: { ...money('saldo'), default: 0 }, estatus: status,
});
export const MovimientoFinancieroSchema = entity('MovimientoFinanciero', 'movimientos_financieros', {
  id, cuentaId: uuid('cuenta_id', true), cuentaOrigenId: uuid('cuenta_origen_id', true),
  cuentaDestinoId: uuid('cuenta_destino_id', true), pagoId: uuid('pago_id', true), usuarioId: uuid('usuario_id'),
  tipo: text(20), concepto: { type: 'text' }, monto: money('monto'), montoInicial: money('monto_inicial'),
  montoAjuste: money('monto_ajuste'), montoFinal: money('monto_final'),
  saldoDestinoInicial: money('saldo_destino_inicial', true), saldoDestinoFinal: money('saldo_destino_final', true),
  fecha: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
});

export const laboratorioEntities = [SucursalSchema, UsuarioSchema, PacienteSchema, ServicioSchema,
  ProductoSchema, MaterialServicioSchema, EstudioPacienteSchema, MovimientoInventarioSchema,
  PagoSchema, CuentaSchema, MovimientoFinancieroSchema];
