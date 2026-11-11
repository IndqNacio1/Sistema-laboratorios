# Guardado de solicitudes de estudios

La pantalla /solicitudes-estudios permite revisar y guardar una solicitud
clinica real en laboratorio.estudios. Requiere iniciar sesion en /login.
La ruta antigua /api/estudios conserva su funcion de catalogo de servicios.
El acceso y el registro administrado de cuentas se describen en
[Inicio de sesion y creacion de cuentas](inicio-sesion-cuentas.md).
El menu Solicitudes y el inicio de sesion abren /solicitudes-estudios/listado.
Desde ahi se puede abrir Nueva solicitud y volver con Ver solicitudes.

## Endpoints

| Metodo | Ruta | Uso |
| --- | --- | --- |
| POST | /api/auth/login | Recibe correo y password y devuelve el token existente. |
| GET | /api/solicitudes-estudios/opciones | Pacientes y servicios activos disponibles para registrar, usuario y sucursal. |
| GET | /api/solicitudes-estudios | Listado paginado con paciente, servicio, fecha y estado, limitado por rol y sucursal. |
| POST | /api/solicitudes-estudios | Guarda el estudio con usuario autenticado y estado pendiente, respuesta 201. |
| GET | /api/solicitudes-estudios/:id | Consulta el registro segun rol y sucursal. |

Las rutas de solicitudes requieren Authorization: Bearer seguido del token.
El frontend conserva el JWT en sessionStorage y lo retira al cerrar sesion
o recibir 401. No almacena contrasenas ni fichas de pacientes en ese storage.

El alta recibe solamente pacienteId y servicioId. El backend ignora usuario,
estado, resultado, fecha e importes enviados por el cliente. Genera el UUID
y registra usuarioId desde la sesion. La respuesta incluye id, pacienteId,
servicioId, usuarioId, fecha y estado pendiente.

## Permisos y validaciones

- Recepcion y operativo registran solicitudes de pacientes de su sucursal.
- Administrador puede registrar y consultar en otras sucursales activas.
- Supervisor consulta el listado y los registros por identificador de su sucursal; no registra solicitudes.
- Se valida la firma HS256 y expiracion del JWT. La cuenta y el rol se consultan nuevamente en PostgreSQL, sin confiar en el rol del token.
- La cuenta debe seguir activa. La sucursal del usuario y la del paciente deben estar activas y sin expiracion vencida al guardar.
- Paciente y servicio deben existir y seguir activos, aunque hayan cambiado despues de abrir el formulario.
- La transaccion bloquea en lectura los registros validados durante el alta para evitar cambios antes del INSERT.
- El guardado no cobra ni reserva inventario. El costo mostrado es referencial, no una cotizacion historica persistida.

Errores: 400 por seleccion invalida o registros inactivos, 401 por sesion no
valida, 403 por rol o sucursal no autorizados, 404 por registro inexistente
y 500/503 por fallos internos o de verificacion de sesion.

## Interfaz

El formulario conserva la revision si falla el guardado y bloquea el boton
mientras hay una solicitud en curso. Solo confirma despues de recibir el
registro del servidor. La confirmacion muestra folio y estado.
Nueva solicitud vuelve a consultar las opciones. El encabezado muestra la
sucursal de la sesion en esta pantalla.

## Listado

GET /api/solicitudes-estudios acepta search (hasta 100 caracteres), estado,
page (desde 1 hasta 999999) y limit (desde 1 hasta 50; predeterminado 20).
Los estados admitidos son pendiente, en_proceso, completado y cancelado.
La busqueda es literal, sin distinguir mayusculas, por nombre completo del
paciente, nombre del servicio o folio. Los filtros y permisos se aplican
antes de contar y paginar; valores invalidos devuelven 400.

La respuesta contiene items, total, page, limit y usuario (identidad, rol
y sucursal actuales). Cada item incluye id, pacienteId, servicioId,
sucursalId, paciente, servicio, fecha y estado; no devuelve resultados
clinicos ni contrasenas. Se ordena por fecha e identificador descendentes.

Recepcion, operativo y supervisor ven registros de pacientes de su sucursal;
administrador consulta todas las sucursales. La sucursal del usuario debe
seguir activa y sin expiracion vencida. Las solicitudes historicas se
conservan en la consulta aunque el paciente o el servicio se inactiven.
La sucursal se determina por la asignacion actual del paciente.

La pantalla permite buscar, filtrar estado, actualizar y recorrer paginas
de 20 registros. Al cambiar filtros vuelve a la primera pagina y cancela
consultas anteriores. Muestra carga, listado vacio, error con reintento y
acceso al login cuando vence la sesion. No conserva filas antiguas al fallar
una nueva consulta. Recargar vuelve a consultar PostgreSQL.

## Verificacion

Ejecutar node --test apps/backend/tests/*.test.mjs apps/frontend/tests/*.test.mjs
y npm --workspace apps/frontend run build desde la raiz.

Se verificaron persistencia real, usuario y estado impuestos por el servidor,
permisos por rol, consultas entre sucursales, cuentas inactivas, vencimiento
del token y revalidacion de paciente, servicio y sucursal.

En navegador se probo el inicio de sesion real, seleccion y costo, error de
guardado sin perdida del borrador, confirmacion persistida, nueva solicitud
y cierre de sesion. Se revisaron capturas en escritorio y movil. Los registros
temporales se retiraron al terminar.

El listado se verifico con filtros literales, paginacion, conteo limitado
por sucursal, permisos actuales incluso con un token ya emitido, supervisor
y persistencia tras recarga. En navegador se comprobo el flujo login, alta,
listado, recarga, busqueda, estado, vacio, error y reintento; tambien la
vista movil sin desbordamiento de pagina. La suite completa pasa 76 pruebas.

## Pendientes y limites

- Usuarios y solicitudes requieren sesion y permisos. Los demas endpoints anteriores de administracion mantienen el acceso existente; falta completar su proteccion.
- Agregar idempotencia antes de habilitar reintentos automaticos. Bloquear dobles clics no evita duplicados si se pierde una respuesta y se reenvia manualmente.
- Implementar la ficha detallada y el seguimiento de cambios de estado. El listado actual es de consulta y no modifica solicitudes.
- Definir precio historico, cobros, inventario y auditoria del flujo.
