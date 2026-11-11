# Inicio de sesion y creacion de cuentas

## Uso

1. Entrar a /login con correo y contrasena. Se puede mostrar u ocultar la contrasena.
2. El acceso correcto abre /solicitudes-estudios/listado, salvo regreso a una
   ruta interna conocida mediante next. No se permiten destinos externos.
3. Administrador puede abrir Crear cuenta desde el login o Nuevo usuario
   desde /usuarios. /crear-cuenta verifica la sesion y los permisos.
4. Registrar nombres, apellidos, correo, rol y sucursal; asignar y confirmar
   una contrasena de al menos 8 caracteres y un maximo de 72 bytes UTF-8.
5. El alta conserva la sesion del administrador. Ingresar con la nueva cuenta
   cierra esa sesion y abre el login; no muestra ni conserva la contrasena
   despues del alta. La cuenta nueva ya puede acceder a solicitudes.

El registro es administrado segun las reglas del proyecto. Recepcion y
operativo no crean usuarios; supervisor consulta usuarios de su sucursal.
Los registros iniciales de administracion deben aprovisionarse localmente
por el responsable del entorno; no existe alta publica de administradores.

## API vigente

| Metodo | Ruta | Comportamiento |
| --- | --- | --- |
| POST | /api/auth/login | Publico. Recibe correo y password; devuelve mensaje y JWT de dos horas. |
| GET | /api/auth/me | JWT. Devuelve id, nombre, apellidos, correo, rol, sucursalId y sucursalNombre. |
| GET | /api/usuarios/opciones-registro | Administrador. Devuelve sucursales activas/vigentes y roles. |
| POST | /api/usuarios | Administrador. Recibe nombre, apellidos, correo, password, rol y sucursalId; devuelve cuenta sin hash, estado activo y respuesta 201. |
| GET | /api/usuarios | Administrador: todas las cuentas. Supervisor: su sucursal. Otros roles: 403. |

El correo se normaliza sin distinguir mayusculas y PostgreSQL garantiza
unicidad. Un duplicado devuelve 409. Nombre y apellidos admiten hasta 100
caracteres; apellidos es opcional en API por compatibilidad y requerido
en la pantalla de alta. El cliente no envia confirmPassword al servidor.

El backend usa bcrypt con costo 12 para cuentas nuevas. No permite asignar
un estatus distinto durante el alta. Revalida cuenta administradora, rol y
sucursales dentro de una transaccion con bloqueo de lectura antes de guardar.
La sucursal del administrador y la seleccionada deben seguir activas y vigentes.

Credenciales incorrectas devuelven el mismo mensaje y codigo 401, exista o
no el correo. Cuenta inactiva o sucursal inactiva/vencida devuelve 403 al
ingresar con credenciales correctas. El JWT conserva HS256 y se valida
contra la cuenta actual; no se confia en el rol guardado en el token.

El frontend guarda solo el JWT en sessionStorage y lo elimina al cerrar
sesion o recibir 401. Cerrar sesion es local: no hay revocacion del token
en el servidor ni recuperacion automatica de contrasena.

## Comprobacion

83 pruebas automatizadas aprobadas y compilacion frontend correcta.
Pruebas HTTP reales de permisos, altas, bcrypt, duplicados, datos invalidos,
login, sesion actual, sucursales inactivas/vencidas y listado de solicitudes.
En navegador se verifico login incorrecto/correcto, mostrar contrasena,
retorno al registro, confirmacion distinta, alta real, sesion administradora
conservada, cambio de cuenta, registro de solicitud y permisos de recepcion.
Se revisaron escritorio y movil; los datos temporales se retiraron.

## Alcance pendiente

Completar proteccion de los otros modulos, recuperacion de contrasena,
revocacion de sesiones y controles operativos antes de publicacion.
No se crearon commits ni se hizo push de este avance.
