# Diccionario de datos inicial

Este documento define los campos iniciales de las entidades principales del sistema. La informacion servira como base para preparar el diagrama de base de datos y los modelos del backend.

## Usuario

Entidad que representa a una persona con acceso a la plataforma.

| Campo | Tipo inicial | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| id | UUID | Si | Identificador unico del usuario. |
| sucursalId | UUID | Si | Identificador de la sucursal asignada. |
| nombres | String | Si | Nombre o nombres del usuario. |
| apellidos | String | Si | Apellidos del usuario. |
| correo | String | Si | Correo utilizado para iniciar sesion. |
| contrasena | String | Si | Contrasena protegida del usuario. |
| rol | Enum | Si | Tipo de usuario dentro del sistema. |
| fechaNacimiento | Date | No | Fecha de nacimiento del usuario. |
| edad | Int | No | Edad del usuario, pendiente de definir si se calcula o se almacena. |
| genero | Enum | No | Genero del usuario. |
| estatus | Enum | Si | Estado del usuario dentro del sistema. |
| createdAt | Timestamp | Si | Fecha de creacion del registro. |
| updatedAt | Timestamp | Si | Fecha de ultima actualizacion del registro. |

### Reglas iniciales

- El correo debe ser unico.
- El usuario debe pertenecer a una sola sucursal.
- El rol debe pertenecer al catalogo permitido.
- El estatus define si el usuario puede iniciar sesion.
- La baja del usuario debe realizarse mediante cambio de estatus.

### Roles considerados

- Administrador
- Supervisor
- Operativo
- Recepcion

### Estatus considerados

- Activo
- Inactivo

## Pendientes

- Definir si `edad` se almacenara o se calculara desde `fechaNacimiento`.
- Definir catalogo final para `genero`.
- Definir reglas de contrasena.
- Definir si se agregaran campos de recuperacion de cuenta.
