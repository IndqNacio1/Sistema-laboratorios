# Integracion del frontend de usuarios

## Operaciones conectadas

- `GET /api/usuarios`: consulta autenticada; administrador ve todas las sucursales y supervisor solo la propia.
- `POST /api/usuarios`: solo administrador, registra con `nombre`, `apellidos`, `correo`, `password`, `rol` y `sucursalId`.
- `GET /api/usuarios/opciones-registro`: solo administrador, devuelve sucursales activas y vigentes y roles disponibles.
- `GET /api/auth/me`: consulta la identidad y sucursal de la sesion actual sin devolver contrasena.
- Busqueda por nombre o correo y filtro por rol sobre los registros recibidos.
- Contadores calculados desde el listado, sin registros de ejemplo.
- Carga, reintento, lista vacia, confirmacion de alta y errores de solicitud.
- Validacion de campos obligatorios, confirmacion de contrasena, correo y longitudes. El servidor valida rol, unicidad y sucursal nuevamente.
- El formulario conserva los datos cuando falla el registro y bloquea envios repetidos mientras guarda.

## Configuracion

El frontend usa `http://localhost:3000/api` por defecto. Para otro servidor,
crear `apps/frontend/.env.local` con la variable de `apps/frontend/.env.example`
y reiniciar Vite. Esta variable es publica; no debe contener secretos.


VITE_API_URL=http://localhost:3000/api


Ejecutar desde la raiz del repositorio, en terminales separadas:

```bash
npm run dev:backend
npm run dev:frontend
```

Abrir `/usuarios` en la direccion indicada por Vite.
Iniciar sesion en `/login`. El enlace Nuevo usuario abre `/crear-cuenta`.
La cuenta de recepcion puede entrar a solicitudes, pero no administrar usuarios.

## Diferencias con el contrato inicial

La implementacion actual del controlador utiliza `nombre`, `apellidos` y `password`,
en lugar de `nombres` y `contrasena`. Devuelve un arreglo para el listado
y el registro creado para el alta. El servicio adapta estos datos y descarta
campos adicionales, incluida la contrasena, antes de guardarlos en estado.

El registro permite elegir la sucursal y crea la cuenta con estatus activo.
No utiliza Matriz como asignacion implicita: sucursalId es obligatorio.
Los filtros de sucursal y estatus quedan pendientes de integrar con estos campos.
El valor historico `recepcionista` se migra a `recepcion`.

## Dependencias pendientes del backend

- Implementar la ruta de edicion. `usuario.routes.js` solo registra GET y POST;
  los PUT/PATCH descritos en documentos anteriores aun no existen.
- Implementar rutas para cambios de estado y asignacion de sucursal.
- Completar la proteccion de los demas modulos. Usuarios y solicitudes ya requieren JWT y verifican rol y sucursal.

## Verificacion

```bash
node --test apps/frontend/tests/usersService.test.mjs
npm --workspace apps/frontend run build
```

Las pruebas del servicio cubren consultas, respuestas incompatibles, altas,
campos del payload, errores HTTP y cancelacion. Las comprobaciones de navegador
con respuestas controladas cubren carga, consulta, busqueda, alta, validacion,
duplicados y listado vacio en escritorio y movil. Estas comprobaciones no
sustituyen una prueba de persistencia contra PostgreSQL.

La conexion local a PostgreSQL quedo verificada: `/api/health` y `/api/usuarios`
con una sesion autorizada responden 200. Las pruebas reales registran un usuario, comprueban su persistencia
en `laboratorio.usuarios`, consultan el listado, rechazan duplicados y verifican
el inicio de sesion con JWT. Los datos temporales se retiran al finalizar.
El hash se excluye de las consultas normales mediante el modelo TypeORM.

Se corrigio la dependencia inexistente `typeorm@^1.1.1` por `^0.3.28` y se
actualizo el lockfile. La instalacion se completo con `npm ci --ignore-scripts`.
En este equipo npm requirio los certificados del sistema, usando
`NODE_OPTIONS=--use-system-ca` solo durante la instalacion.
