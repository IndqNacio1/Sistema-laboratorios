# Diccionario de datos inicial

Este documento define los campos iniciales de las entidades principales del sistema. La informacion servira como base para preparar el diagrama de base de datos y los modelos del backend.

## Alcance de esta version

Esta version cubre las entidades iniciales de la Fase 1:

- Usuario
- Sucursal
- Paciente
- Estudio
- Servicio
- Pago
- Producto

Las entidades de movimientos se documentaran en fases posteriores.

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

## Sucursal

Entidad que representa una sede o unidad del laboratorio.

| Campo | Tipo inicial | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| id | UUID | Si | Identificador unico de la sucursal. |
| nombre | String | Si | Nombre de la sucursal. |
| direccion | String | Si | Ubicacion fisica de la sucursal. |
| telefono | String | No | Telefono de contacto de la sucursal. |
| estatus | Enum | Si | Estado de la sucursal dentro del sistema. |
| createdAt | Timestamp | Si | Fecha de creacion del registro. |
| updatedAt | Timestamp | Si | Fecha de ultima actualizacion del registro. |
| expiresAt | Timestamp | No | Fecha de expiracion o desactivacion programada, si aplica. |

### Reglas iniciales

- Una sucursal puede tener varios usuarios.
- Una sucursal puede tener varios pacientes.
- Solo el administrador puede consultar todas las sucursales.
- Los usuarios operativos solo trabajan con la sucursal asignada.
- Una sucursal inactiva no debe estar disponible para nuevas asignaciones.

### Estatus considerados

- Activa
- Inactiva

## Paciente

Entidad que representa a la persona que recibe servicios o estudios del laboratorio.

| Campo | Tipo inicial | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| id | UUID | Si | Identificador unico del paciente. |
| sucursalId | UUID | Si | Identificador de la sucursal donde se registro el paciente. |
| nombres | String | Si | Nombre o nombres del paciente. |
| apellidos | String | Si | Apellidos del paciente. |
| telefono | String | No | Telefono de contacto del paciente. |
| correo | String | No | Correo de contacto del paciente. |
| fechaNacimiento | Date | No | Fecha de nacimiento del paciente. |
| edad | Int | No | Edad del paciente, pendiente de definir si se calcula o se almacena. |
| genero | Enum | No | Genero del paciente. |
| estatus | Enum | Si | Estado del paciente dentro del sistema. |
| createdAt | Timestamp | Si | Fecha de creacion del registro. |
| updatedAt | Timestamp | Si | Fecha de ultima actualizacion del registro. |

### Reglas iniciales

- El paciente debe pertenecer a una sucursal.
- El paciente puede tener varios estudios asociados.
- El historial del paciente se conserva aunque el paciente quede inactivo.
- La baja del paciente debe manejarse mediante cambio de estatus.
- Se debe evitar duplicar pacientes cuando sea posible.

### Estatus considerados

- Activo
- Inactivo

## Estudio

Entidad que representa un estudio realizado o solicitado para un paciente.

| Campo | Tipo inicial | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| id | UUID | Si | Identificador unico del estudio. |
| pacienteId | UUID | Si | Identificador del paciente asociado al estudio. |
| servicioId | UUID | Si | Identificador del servicio o estudio de catalogo. |
| usuarioId | UUID | Si | Identificador del usuario que registro o atendio el estudio. |
| fecha | Date | Si | Fecha en que se registra o realiza el estudio. |
| resultado | String | No | Resultado o interpretacion del estudio. |
| estado | Enum | Si | Estado operativo del estudio. |
| createdAt | Timestamp | Si | Fecha de creacion del registro. |
| updatedAt | Timestamp | Si | Fecha de ultima actualizacion del registro. |

### Reglas iniciales

- El estudio debe pertenecer a un paciente existente.
- El estudio debe relacionarse con un servicio activo.
- El estudio debe registrar el usuario que lo creo o atendio.
- El resultado puede quedar pendiente al momento de registrar el estudio.
- El historial del paciente se obtiene a partir de los estudios asociados.

### Estados considerados

- Pendiente
- En proceso
- Completado
- Cancelado

## Servicio

Entidad que representa el catalogo de servicios o estudios que ofrece el laboratorio.

| Campo | Tipo inicial | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| id | UUID | Si | Identificador unico del servicio. |
| nombre | String | Si | Nombre del servicio o estudio. |
| descripcion | String | No | Descripcion general del servicio. |
| costo | Number | Si | Precio base del servicio. |
| estatus | Enum | Si | Estado del servicio dentro del catalogo. |
| createdAt | Timestamp | Si | Fecha de creacion del registro. |
| updatedAt | Timestamp | Si | Fecha de ultima actualizacion del registro. |

### Reglas iniciales

- El nombre del servicio debe ser obligatorio.
- El costo debe ser mayor o igual a cero.
- Un servicio inactivo no debe estar disponible para nuevos estudios.
- Un servicio puede requerir insumos del inventario.
- Los materiales requeridos se documentaran con una entidad de relacion en una fase posterior.

### Estatus considerados

- Activo
- Inactivo

## Pago

Entidad que representa el registro de cobro asociado a un estudio o servicio realizado.

| Campo | Tipo inicial | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| id | UUID | Si | Identificador unico del pago. |
| estudioId | UUID | Si | Identificador del estudio asociado al pago. |
| usuarioId | UUID | Si | Identificador del usuario que atendio el cobro. |
| monto | Number | Si | Total a cobrar por el estudio o servicio. |
| montoRecibido | Number | No | Cantidad entregada por el paciente al momento del cobro. |
| cambioDevuelto | Number | No | Cambio entregado al paciente cuando aplique. |
| metodoPago | Enum | Si | Metodo utilizado para realizar el pago. |
| estado | Enum | Si | Estado del pago. |
| fecha | Date | Si | Fecha en que se registra el pago. |
| createdAt | Timestamp | Si | Fecha de creacion del registro. |
| updatedAt | Timestamp | Si | Fecha de ultima actualizacion del registro. |

### Reglas iniciales

- El pago debe pertenecer a un estudio registrado.
- El pago debe registrar el usuario que atendio el cobro.
- El monto debe ser mayor o igual a cero.
- El metodo de pago debe pertenecer al catalogo permitido.
- Si el pago se realiza en efectivo, se debe contemplar monto recibido y cambio devuelto.
- El pago puede generar un movimiento financiero.

### Metodos de pago considerados

- Efectivo
- Tarjeta
- Transferencia

### Estados considerados

- Pendiente
- Pagado
- Parcial
- Cancelado

## Producto

Entidad que representa un insumo o producto utilizado por el laboratorio.

| Campo | Tipo inicial | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| id | UUID | Si | Identificador unico del producto. |
| nombre | String | Si | Nombre del producto o insumo. |
| codigoBarras | String | No | Codigo de barras del producto, si aplica. |
| clave | String | No | Clave interna o externa para identificar el producto. |
| unidadMedida | String | Si | Unidad en la que se controla el producto. |
| stock | Number | Si | Existencia actual del producto. |
| stockMinimo | Number | No | Cantidad minima recomendada antes de generar alerta. |
| foto | String | No | Ruta o referencia visual del producto. |
| estatus | Enum | Si | Estado del producto dentro del catalogo. |
| createdAt | Timestamp | Si | Fecha de creacion del registro. |
| updatedAt | Timestamp | Si | Fecha de ultima actualizacion del registro. |

### Reglas iniciales

- El nombre del producto debe ser obligatorio.
- El stock no debe ser negativo.
- El stock no se modifica directamente desde el catalogo de productos.
- Los cambios de existencia deben realizarse mediante compras, inventario inicial o movimientos.
- Un producto inactivo no debe estar disponible para nuevos servicios.
- El stock minimo se usara para identificar posibles faltantes.

### Estatus considerados

- Activo
- Inactivo

## Relaciones iniciales

### Sucursal y Usuario

- Una sucursal puede tener varios usuarios.
- Un usuario pertenece a una sola sucursal.
- La relacion se representa con `Usuario.sucursalId`.
- El administrador puede consultar usuarios de todas las sucursales.
- Los roles supervisor, operativo y recepcion consultan usuarios dentro de su sucursal asignada.

### Sucursal y Paciente

- Una sucursal puede tener varios pacientes.
- Un paciente pertenece a una sucursal.
- La relacion se representa con `Paciente.sucursalId`.
- La sucursal permite identificar donde se registro o atiende al paciente.

### Usuario y Paciente

- El usuario de recepcion puede registrar pacientes.
- El supervisor y administrador pueden consultar pacientes.
- El usuario no se relaciona directamente con paciente en el diccionario inicial, pero sus acciones deberan conservarse en auditoria o historial cuando se implemente.

### Paciente y Estudio

- Un paciente puede tener varios estudios.
- Cada estudio debe pertenecer a un paciente.
- La relacion se representa con `Estudio.pacienteId`.

### Servicio y Estudio

- Un servicio puede utilizarse en varios estudios.
- Cada estudio debe relacionarse con un servicio.
- La relacion se representa con `Estudio.servicioId`.
- El servicio define el costo base del estudio.

### Usuario y Estudio

- Un usuario puede registrar varios estudios.
- Cada estudio debe guardar el usuario que lo registro o atendio.
- La relacion se representa con `Estudio.usuarioId`.

### Servicio e Inventario

- Un servicio puede requerir uno o varios productos del inventario.
- Esta relacion se documentara con una entidad intermedia en una fase posterior.
- La entidad intermedia permitira indicar cantidad requerida por servicio.

## Dependencias entre modulos

| Modulo | Depende de | Motivo |
| --- | --- | --- |
| Usuarios | Sucursales | Cada usuario debe estar asignado a una sucursal. |
| Pacientes | Sucursales | Cada paciente debe registrarse en una sucursal. |
| Estudios | Pacientes | Cada estudio debe asociarse a un paciente. |
| Estudios | Usuarios | Se debe conocer que usuario registro o atendio el estudio. |
| Estudios | Servicios | Cada estudio debe basarse en un servicio del catalogo. |
| Cobros | Estudios | El cobro se realiza sobre un estudio o servicio registrado. |
| Inventario | Servicios | Algunos servicios requieren insumos para realizarse. |

## Prioridad inicial

1. Definir sucursales.
2. Definir usuarios y roles.
3. Definir pacientes.
4. Definir servicios.
5. Definir estudios.
6. Definir cobros e inventario relacionado.

## Pendientes

- Definir si `edad` se almacenara o se calculara desde `fechaNacimiento`.
- Definir catalogo final para `genero`.
- Definir reglas de contrasena.
- Definir si se agregaran campos de recuperacion de cuenta.
- Definir reglas para detectar pacientes duplicados.
- Definir si los estudios permiten pagos parciales.
- Definir entidad intermedia para materiales requeridos por servicio.
