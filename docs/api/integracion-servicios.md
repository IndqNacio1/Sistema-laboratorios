# Integracion del catalogo de servicios

La pantalla `/servicios` consulta y registra servicios del laboratorio y permite
editar nombre, descripcion, costo y estado. Usa la tabla `laboratorio.servicios`;
no crea estudios clinicos ni modifica su historial.

## Rutas

| Metodo | Ruta | Resultado |
| --- | --- | --- |
| GET | /api/servicios | Arreglo ordenado por nombre; admite filtro opcional `estatus`. |
| GET | /api/servicios/:id | Servicio actual o 404. |
| POST | /api/servicios | Servicio registrado, respuesta 201. |
| PUT | /api/servicios/:id | Servicio actualizado, respuesta 200. |

Las rutas `/api/estudios` se conservan como alias del catalogo anterior.
En el frontend `/estudios` tambien abre el catalogo. Los estudios realizados
a pacientes siguen siendo una entidad distinta, pendiente de su propio flujo.

## Campos de registro y edicion

```json
{
  "nombre": "Biometria hematica",
  "descripcion": "Analisis de los componentes de la sangre",
  "precio": "150.00",
  "estatus": "activo"
}
```

- Nombre obligatorio, sin espacios vacios y con un maximo de 150 caracteres.
- Descripcion opcional de hasta 2000 caracteres; vacio se almacena como NULL.
- El costo utiliza el campo `precio` para conservar el contrato anterior y se mapea a la columna `costo`.
- Se acepta desde cero hasta 9999999999.99, con hasta dos decimales. Se normaliza a dos decimales sin calculos de punto flotante y se almacena como NUMERIC(12,2).
- Estatus admite `activo` e `inactivo`; por defecto el alta es activa.
- El backend toma solo campos editables. No acepta ids ni auditoria enviada por el cliente.
- PUT conserva UUID y descripcion o estatus omitidos. Nombre y precio siguen siendo obligatorios.
- No hay eliminacion fisica del servicio ni cambios en sus relaciones con estudios.

Errores: 400 para datos invalidos, 404 para registros inexistentes y 500 para
fallos internos, siempre con un campo `message`.

## Frontend

Incluye busqueda por nombre o descripcion, filtro por estado, contadores del
listado y formularios modales. Al abrir una edicion vuelve a consultar el
registro. Los cambios solo aparecen como guardados tras recibir la confirmacion
del servidor. Una recarga conserva los datos porque estan en PostgreSQL.

Hay estados de carga, ausencia de registros, ausencia de coincidencias,
confirmacion y error con reintento. Ante un error de guardado conserva los datos
del formulario. Se bloquean envios repetidos mientras la solicitud esta activa.

## Verificacion

```bash
node --test apps/backend/tests/*.test.mjs apps/frontend/tests/*.test.mjs
npm --workspace apps/frontend run build
```

Las pruebas del catalogo cubren alta, consulta, edicion, costo cero, centavos,
filtros, payload permitido, errores y compatibilidad con las rutas anteriores.
Se ejecutan junto con las pruebas de usuarios, pacientes y base de datos.

La revision en navegador cubre registro y edicion contra la API real,
persistencia tras recargar, validaciones, filtros, errores de guardado con
datos conservados, reintento, Escape y vistas de escritorio y movil. Los
servicios temporales de las pruebas se retiran al terminar.

## Pendientes

- Asociacion de materiales requeridos por servicio.
- Uso del catalogo al solicitar estudios de pacientes.
- Paginacion y reglas de deteccion de servicios duplicados.
- Integracion con la sesion y los permisos del sistema. Las rutas mantienen el acceso actual del proyecto.
