# Guardado de solicitudes de estudios

La pantalla /solicitudes-estudios permite revisar y guardar una solicitud
clinica real en laboratorio.estudios. Requiere iniciar sesion en /login.
La ruta antigua /api/estudios conserva su funcion de catalogo de servicios.

## Endpoints

| Metodo | Ruta | Uso |
| --- | --- | --- |
| POST | /api/auth/login | Recibe correo y password y devuelve el token existente. |
| GET | /api/solicitudes-estudios/opciones | Pacientes y servicios activos disponibles para registrar, usuario y sucursal. |
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
- Supervisor solo consulta por identificador registros de su sucursal; no registra solicitudes.
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

## Pendientes y limites

- La proteccion agregada aplica al flujo de solicitudes. Los endpoints anteriores de administracion aun mantienen el acceso existente, incluidos los de usuarios; cerrar esos permisos es necesario para completar la seguridad global.
- Agregar idempotencia antes de habilitar reintentos automaticos. Bloquear dobles clics no evita duplicados si se pierde una respuesta y se reenvia manualmente.
- Implementar listado e historial de solicitudes en el frontend.
- Definir precio historico, cobros, inventario y auditoria del flujo.
