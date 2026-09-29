# Estructura inicial de rutas

Este documento propone las rutas iniciales del frontend y backend para los modulos prioritarios del sistema de laboratorios.

## Rutas frontend

| Ruta | Modulo | Descripcion |
| --- | --- | --- |
| `/login` | Autenticacion | Pantalla de inicio de sesion. |
| `/dashboard` | Inicio | Pantalla principal posterior al inicio de sesion. |
| `/usuarios` | Usuarios | Listado y gestion de usuarios. |
| `/sucursales` | Sucursales | Gestion de sucursales. |
| `/pacientes` | Pacientes | Listado y busqueda de pacientes. |
| `/pacientes/nuevo` | Pacientes | Registro de paciente. |
| `/pacientes/:id` | Pacientes | Consulta de expediente e historial. |
| `/servicios` | Servicios | Catalogo de servicios o estudios. |
| `/estudios` | Estudios | Listado de estudios registrados. |
| `/estudios/nuevo` | Estudios | Registro de estudio. |
| `/pagos` | Pagos | Consulta de pagos y cobros. |
| `/productos` | Inventario | Catalogo de productos o insumos. |

## Rutas backend API

| Metodo | Ruta | Modulo | Descripcion |
| --- | --- | --- | --- |
| GET | `/health` | Sistema | Verificacion de estado de la API. |
| POST | `/auth/login` | Autenticacion | Inicio de sesion. |
| POST | `/auth/logout` | Autenticacion | Cierre de sesion. |
| GET | `/usuarios` | Usuarios | Consultar usuarios. |
| POST | `/usuarios` | Usuarios | Crear usuario. |
| GET | `/usuarios/:id` | Usuarios | Consultar usuario por id. |
| PUT | `/usuarios/:id` | Usuarios | Editar usuario. |
| PATCH | `/usuarios/:id/estatus` | Usuarios | Cambiar estatus de usuario. |
| GET | `/sucursales` | Sucursales | Consultar sucursales. |
| POST | `/sucursales` | Sucursales | Crear sucursal. |
| GET | `/pacientes` | Pacientes | Consultar pacientes. |
| POST | `/pacientes` | Pacientes | Crear paciente. |
| GET | `/pacientes/:id` | Pacientes | Consultar paciente e historial. |
| PUT | `/pacientes/:id` | Pacientes | Editar paciente. |
| PATCH | `/pacientes/:id/estatus` | Pacientes | Cambiar estatus de paciente. |
| GET | `/servicios` | Servicios | Consultar servicios. |
| POST | `/servicios` | Servicios | Crear servicio. |
| GET | `/estudios` | Estudios | Consultar estudios. |
| POST | `/estudios` | Estudios | Registrar estudio. |
| GET | `/estudios/:id` | Estudios | Consultar estudio. |
| PATCH | `/estudios/:id/resultado` | Estudios | Registrar o actualizar resultado. |
| GET | `/pagos` | Pagos | Consultar pagos. |
| POST | `/pagos` | Pagos | Registrar pago. |
| GET | `/productos` | Inventario | Consultar productos. |
| POST | `/productos` | Inventario | Crear producto. |
| PUT | `/productos/:id` | Inventario | Editar producto. |

## Rutas pendientes para fases posteriores

- Compras.
- Inventario inicial.
- Movimientos de inventario.
- Cuentas financieras.
- Movimientos financieros.
- Corte de caja.
- Estados de cuenta.
- Reportes.

## Criterios iniciales

- Las rutas del backend deben mantener nombres en plural.
- Las acciones de baja deben manejarse por cambio de estatus.
- Las rutas protegidas deben validar sesion y rol.
- Las rutas de consulta deben filtrar informacion segun sucursal cuando aplique.
- La estructura puede ajustarse al iniciar la implementacion de cada modulo.
