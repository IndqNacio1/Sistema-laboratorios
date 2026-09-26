# Cierre semanal - 2026-09-25

## Objetivo

Revisar el avance semanal, sincronizar la documentacion tecnica con los wireframes en Figma y dejar pendientes claros para continuar con arquitectura inicial y base de datos.

## Sincronizacion Figma y documentacion tecnica

### Pantallas revisadas

- Login.
- Dashboard del administrador.
- Panel de recepcion.
- Registro de pacientes.
- Registro de estudios.
- Cobro de servicios.

### Criterios revisados

- Las pantallas deben contemplar los campos definidos en el diccionario de datos.
- Las vistas de pacientes deben considerar nombres, apellidos, telefono, correo, fecha de nacimiento, genero y estatus.
- Las vistas de estudios deben considerar paciente, servicio, usuario responsable, fecha, estado y resultado.
- Las vistas de cobro deben considerar estudio, monto, metodo de pago, monto recibido, cambio devuelto y usuario que atendio.
- Las vistas relacionadas con inventario deben considerar producto, unidad de medida, stock, stock minimo, codigo de barras y estatus.

## Avance documentado de la semana

- Se corrigio el diagrama inicial de clases.
- Se documento el diccionario de datos inicial.
- Se definieron campos para Usuario, Sucursal, Paciente, Estudio, Servicio, Pago y Producto.
- Se documentaron relaciones entre pacientes, estudios, servicios, pagos, productos e inventario.
- Se dejaron pendientes para preparar el diagrama de base de datos.

## Pendientes tecnicos para la siguiente semana

- Preparar diagrama inicial de base de datos.
- Definir entidad intermedia para materiales requeridos por servicio.
- Definir movimientos de inventario.
- Definir movimientos financieros.
- Definir reglas para pagos parciales y cuentas por cobrar.
- Revisar si `edad` se almacenara o se calculara desde `fechaNacimiento`.

## Pendientes de diseno para la siguiente semana

- Ajustar wireframes con los campos definidos en el diccionario de datos.
- Validar formularios de pacientes, estudios y cobros.
- Revisar jerarquia visual del dashboard administrativo.
- Continuar la diagramacion visual del flujo de recepcion.

## Evidencia sugerida

- Captura del diccionario de datos actualizado.
- Captura del canvas de Figma con wireframes.
- Captura del historial de commits.
- Captura de la carpeta `docs` actualizada.
