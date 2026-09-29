# Reglas de acceso por rol

Este documento define las reglas iniciales de acceso por rol para las pantallas y modulos principales del sistema.

## Roles

- Administrador.
- Supervisor.
- Operativo.
- Recepcion.

## Reglas generales

- Todos los usuarios deben iniciar sesion para acceder al sistema.
- Un usuario inactivo no puede iniciar sesion.
- Cada usuario pertenece a una sola sucursal.
- Solo el administrador puede consultar informacion de todas las sucursales.
- Supervisor, operativo y recepcion solo consultan informacion de su sucursal asignada.
- La baja de usuarios se maneja por estatus.

## Matriz de acceso

| Modulo | Administrador | Supervisor | Operativo | Recepcion |
| --- | --- | --- | --- | --- |
| Dashboard | Si | Si | Si | Si |
| Usuarios | Si | Consulta | No | No |
| Sucursales | Si | No | No | No |
| Pacientes | Si | Si | Consulta | Si |
| Servicios | Si | Consulta | Consulta | Consulta |
| Estudios | Si | Si | Si | Registro |
| Pagos | Si | Consulta | No | Si |
| Productos | Si | Si | Consulta | No |
| Inventario | Si | Si | Consulta | No |
| Reportes | Si | Si | No | No |

## Reglas por modulo

### Usuarios

- Administrador puede crear, editar, consultar y cambiar estatus.
- Supervisor solo puede consultar usuarios de su sucursal si el flujo lo requiere.
- Operativo y recepcion no administran usuarios.

### Pacientes

- Administrador y supervisor pueden consultar informacion de pacientes.
- Recepcion puede registrar y editar pacientes.
- Operativo puede consultar pacientes para registrar estudios.

### Estudios

- Operativo puede registrar estudios y capturar resultados.
- Recepcion puede registrar solicitud inicial de estudio cuando aplique.
- Supervisor puede consultar y dar seguimiento.
- Administrador puede consultar todos los registros.

### Pagos

- Recepcion puede registrar pagos.
- Administrador puede consultar y auditar pagos.
- Supervisor puede consultar pagos de su sucursal.
- Operativo no registra pagos.

### Productos e inventario

- Administrador y supervisor pueden gestionar inventario.
- Operativo puede consultar disponibilidad de insumos.
- Recepcion no gestiona inventario.

## Pendientes

- Definir permisos finales por endpoint.
- Definir middleware de autenticacion.
- Definir middleware de autorizacion por rol.
- Definir reglas especificas para sucursales.
- Validar permisos contra los wireframes finales.
