# Integracion del frontend de usuarios

## Operaciones conectadas

- `GET /api/usuarios`: consulta el listado desde el servidor.
- `POST /api/usuarios`: registra con `nombre`, `correo`, `password` y `rol`.
- Busqueda por nombre o correo y filtro por rol sobre los registros recibidos.
- Contadores calculados desde el listado, sin registros de ejemplo.
- Carga, reintento, lista vacia, confirmacion de alta y errores de solicitud.
- Validacion de campos obligatorios, correo, longitudes y duplicados locales. El servidor debe validar nuevamente y garantizar la unicidad del correo.
- El formulario conserva los datos cuando falla el registro y bloquea envios repetidos mientras guarda.

## Configuracion

El frontend usa `http://localhost:3000/api` por defecto. Para otro servidor,
crear `apps/frontend/.env.local` con la variable de `apps/frontend/.env.example`
y reiniciar Vite. Esta variable es publica; no debe contener secretos.

```text
VITE_API_URL=http://localhost:3000/api
```

Ejecutar desde la raiz del repositorio, en terminales separadas:

```bash
npm run dev:backend
npm run dev:frontend
```

Abrir `/usuarios` en la direccion indicada por Vite.

## Diferencias con el contrato inicial

La implementacion actual del controlador utiliza `nombre` y `password`,
no `nombres`, `apellidos` y `contrasena`. Devuelve un arreglo para el listado
y el registro creado para el alta. El servicio adapta estos datos y descarta
campos adicionales, incluida la contrasena, antes de guardarlos en estado.

El modelo relacional ahora tiene sucursal y estatus. La pantalla conserva
sus campos actuales; la asignacion inicial utiliza Matriz y estatus activo.
Los filtros de sucursal y estatus quedan pendientes de integrar con estos campos.
El valor historico `recepcionista` se migra a `recepcion`.

## Dependencias pendientes del backend

- Implementar la ruta de edicion. `usuario.routes.js` solo registra GET y POST;
  los PUT/PATCH descritos en documentos anteriores aun no existen.
- Implementar rutas para cambios de estado y asignacion de sucursal.
- Completar la proteccion de rutas y el flujo de sesion antes de integrar JWT
  en las solicitudes del frontend. Las rutas actuales de usuarios son publicas.

## Verificacion

```bash
node --test apps/frontend/tests/usersService.test.mjs
npm --workspace apps/frontend run build
```

Seis pruebas del servicio cubren consultas, respuestas incompatibles, altas,
campos del payload, errores HTTP y cancelacion. Las comprobaciones de navegador
con respuestas controladas cubren carga, consulta, busqueda, alta, validacion,
duplicados y listado vacio en escritorio y movil. Estas comprobaciones no
sustituyen una prueba de persistencia contra PostgreSQL.

La conexion local a PostgreSQL quedo verificada: `/api/health` y `/api/usuarios`
responden 200. Las pruebas reales registran un usuario, comprueban su persistencia
en `laboratorio.usuarios`, consultan el listado, rechazan duplicados y verifican
el inicio de sesion con JWT. Los datos temporales se retiran al finalizar.
El hash se excluye de las consultas normales mediante el modelo TypeORM.

Se corrigio la dependencia inexistente `typeorm@^1.1.1` por `^0.3.28` y se
actualizo el lockfile. La instalacion se completo con `npm ci --ignore-scripts`.
En este equipo npm requirio los certificados del sistema, usando
`NODE_OPTIONS=--use-system-ca` solo durante la instalacion.
