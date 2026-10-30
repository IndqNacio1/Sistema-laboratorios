# Integracion de sucursales

La pantalla `/sucursales` permite consultar, registrar y editar sucursales
almacenadas en `laboratorio.sucursales`. Incluye busqueda por nombre, direccion
o telefono y filtro por estado. Se integra con la navegacion administrativa
de escritorio y movil.

## API

| Metodo | Ruta | Resultado |
| --- | --- | --- |
| GET | /api/sucursales | Arreglo ordenado por nombre; admite `estatus` como filtro opcional. |
| GET | /api/sucursales/:id | Informacion actual de la sucursal. |
| POST | /api/sucursales | Sucursal registrada, respuesta 201. |
| PUT | /api/sucursales/:id | Sucursal actualizada, respuesta 200. |

```json
{
  "nombre": "Sucursal Norte",
  "direccion": "Calle de ejemplo 123",
  "telefono": "+52 6681234567",
  "estatus": "activo"
}
```

- Nombre obligatorio de hasta 100 caracteres; se recortan espacios externos.
- Direccion obligatoria de hasta 500 caracteres.
- Telefono opcional, hasta 20 caracteres y entre 7 y 15 digitos. Admite espacios, parentesis, punto, guion y signo mas. Vacio se guarda como NULL.
- Estatus admite `activo` e `inactivo`. El alta es activa por defecto.
- El nombre debe ser unico de acuerdo con la restriccion existente de PostgreSQL. La comparacion distingue mayusculas y minusculas.
- Solo se aceptan campos editables. UUID, auditoria y expiracion no se toman del payload.
- PUT mantiene la identidad y las relaciones de la sucursal. Nombre y direccion son obligatorios; telefono y estatus omitidos conservan su valor anterior.
- No hay eliminacion fisica. Inactivar una sucursal no elimina pacientes ni usuarios asociados.

Errores: 400 por datos invalidos, 404 por sucursal inexistente, 409 por nombre
duplicado y 500 por fallo interno. Las respuestas de error incluyen `message`.

El listado conserva `id`, `nombre` y `estatus` para los selectores existentes
de pacientes; ahora tambien devuelve direccion, telefono y auditoria. No se
modifica el esquema SQL ni se requiere una migracion adicional.

## Frontend

La edicion consulta de nuevo el registro antes de abrir el formulario. Al
guardar, el listado usa la respuesta real del servidor. Se muestran carga,
listado vacio, ausencia de coincidencias, confirmacion y errores con reintento.
Un fallo de guardado conserva los valores del formulario. Se bloquean envios
repetidos mientras la solicitud esta activa.

Los filtros de la pantalla operan sobre el listado cargado. El formulario
admite teclado, Escape y desplazamiento interno en movil.

## Verificacion

```bash
node --test apps/backend/tests/*.test.mjs apps/frontend/tests/*.test.mjs
npm --workspace apps/frontend run build
```

Resultado: 55 pruebas aprobadas y compilacion correcta. Las pruebas de API
comprueban persistencia, duplicados, validaciones y conservacion de referencias
de usuarios y pacientes al inactivar una sucursal. Las pruebas retiran solo
sus registros temporales.

Se reviso el flujo de alta, edicion, busqueda, filtros, recarga, telefono
invalido, nombre duplicado, errores de guardado, reintento y Escape contra la
API real. Se inspeccionaron capturas a 1440 y 390 px y se comprobo que no
hubiera desbordamiento a 320 px. Las sucursales temporales se retiraron al finalizar.

## Pendientes

- Paginacion y permisos segun la sesion del sistema.
- Definicion de reglas para expiracion programada de sucursales.
- Revision del encabezado global de sucursal y su seleccion segun el usuario conectado.
