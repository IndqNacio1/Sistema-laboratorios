# Sincronizacion entre Figma y diccionario de datos

Este documento registra los campos que deben considerarse al revisar los wireframes de Figma contra la documentacion tecnica del proyecto.

## Pantalla de login

Campos requeridos:

- Correo.
- Contrasena.

Validaciones esperadas:

- Correo obligatorio.
- Contrasena obligatoria.
- Usuario activo.

## Registro de pacientes

Campos requeridos:

- Nombres.
- Apellidos.
- Telefono.
- Correo.
- Fecha de nacimiento.
- Genero.
- Sucursal.
- Estatus.

Notas:

- Revisar si edad se mostrara como campo capturable o calculado.
- Considerar busqueda previa para evitar duplicados.

## Registro de estudios

Campos requeridos:

- Paciente.
- Servicio.
- Usuario responsable.
- Fecha.
- Estado.
- Resultado.

Notas:

- El resultado puede quedar pendiente al inicio.
- La pantalla debe permitir consultar historial del paciente.

## Cobro de servicios

Campos requeridos:

- Estudio.
- Monto.
- Metodo de pago.
- Monto recibido.
- Cambio devuelto.
- Usuario que atendio.
- Estado del pago.

Notas:

- Revisar si se manejaran pagos parciales.
- El cobro debe relacionarse con movimientos financieros.

## Productos e inventario

Campos requeridos:

- Nombre.
- Codigo de barras.
- Clave.
- Unidad de medida.
- Stock.
- Stock minimo.
- Foto.
- Estatus.

Notas:

- El stock no debe modificarse directamente desde el catalogo.
- Los cambios de existencia deben realizarse mediante movimientos.

## Pendientes de diseno

- Validar que los formularios no omitan campos obligatorios.
- Revisar jerarquia visual de formularios largos.
- Definir estados vacios para tablas y listados.
- Definir mensajes para validaciones y errores.
- Revisar flujo visual para pagos parciales si se aprueba esa regla.
