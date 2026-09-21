# Modulo de autenticacion y usuarios

Este modulo define la forma en que los usuarios ingresan al sistema y las reglas iniciales para controlar su acceso segun rol y sucursal.

## Objetivo

Permitir que solo los usuarios autorizados puedan acceder a la plataforma, limitando sus acciones de acuerdo con su tipo de usuario y la sucursal asignada.

## Alcance inicial

- Inicio de sesion.
- Cierre de sesion.
- Recuperacion de cuenta.
- Registro de usuarios.
- Edicion de usuarios.
- Consulta de usuarios.
- Baja logica de usuarios.
- Asignacion de usuarios a sucursales.
- Control inicial de permisos por rol.

## Flujo de inicio de sesion

1. El usuario captura correo y contrasena.
2. El sistema valida que los campos obligatorios esten completos.
3. El sistema busca el usuario por correo.
4. El sistema valida que el usuario exista.
5. El sistema valida que el usuario se encuentre activo.
6. El sistema valida la contrasena.
7. El sistema identifica el rol del usuario.
8. El sistema identifica la sucursal asignada.
9. El sistema permite el acceso a las pantallas correspondientes.

## Flujo de cierre de sesion

1. El usuario selecciona cerrar sesion.
2. El sistema invalida la sesion activa.
3. El sistema redirige al usuario a la pantalla de inicio de sesion.

## Flujo de recuperacion de cuenta

1. El usuario selecciona la opcion de recuperar cuenta.
2. El usuario ingresa su correo.
3. El sistema valida que el correo exista.
4. El sistema genera una solicitud de recuperacion.
5. El usuario actualiza su contrasena mediante el mecanismo definido.

## Reglas generales

- Cada usuario pertenece a una sola sucursal.
- El usuario no puede cambiar su propia sucursal.
- Solo el administrador puede cambiar la sucursal de otros usuarios.
- Los usuarios no se eliminan fisicamente.
- La baja de usuarios se maneja mediante estatus.
- Un usuario inactivo no puede iniciar sesion.
- El correo debe ser unico dentro del sistema.

## Roles iniciales

### Administrador

Usuario con acceso general al sistema.

Permisos iniciales:

- Consultar informacion de todas las sucursales.
- Crear, editar, consultar y dar de baja usuarios.
- Cambiar usuarios de sucursal.
- Consultar pacientes, estudios, inventario, finanzas y reportes.
- Acceder a configuraciones generales del sistema.

### Supervisor

Usuario encargado de revisar la operacion de una sucursal.

Permisos iniciales:

- Consultar informacion de su sucursal.
- Consultar usuarios de su sucursal.
- Consultar pacientes y estudios.
- Revisar inventario y movimientos.
- Consultar reportes operativos de su sucursal.

### Operativo

Usuario encargado de registrar o dar seguimiento a estudios.

Permisos iniciales:

- Consultar pacientes.
- Registrar estudios.
- Capturar o consultar resultados.
- Revisar disponibilidad de insumos relacionados con estudios.

### Recepcion

Usuario encargado de la atencion inicial del paciente y cobros.

Permisos iniciales:

- Registrar pacientes.
- Consultar pacientes.
- Registrar cobros.
- Consultar cuentas por cobrar.
- Registrar servicios solicitados por el paciente.

## Restricciones iniciales por rol

- Solo el administrador puede administrar usuarios.
- Solo el administrador puede consultar todas las sucursales.
- Supervisor, operativo y recepcion solo trabajan con su sucursal asignada.
- Operativo no debe modificar informacion financiera.
- Recepcion no debe modificar resultados de estudios.
- Los usuarios inactivos no aparecen como opcion para nuevas tareas.
