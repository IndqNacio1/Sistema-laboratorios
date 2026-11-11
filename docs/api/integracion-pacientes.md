# Integracion de pacientes

## Alcance

La pantalla `/pacientes` permite consultar, registrar, abrir la ficha y editar
pacientes con datos reales de PostgreSQL. Incluye busqueda por nombre completo,
correo o telefono y filtros por sucursal y estado. Los filtros de la pantalla
se aplican al listado recibido; aun no hay paginacion del frontend.

## Rutas

| Metodo | Ruta | Resultado |
| --- | --- | --- |
| GET | /api/pacientes | Arreglo de pacientes ordenado por apellidos y nombre. |
| GET | /api/pacientes/:id | Ficha actual del paciente. |
| POST | /api/pacientes | Registro nuevo, respuesta 201. |
| PUT | /api/pacientes/:id | Actualizacion de campos editables, respuesta 200. |
| GET | /api/sucursales | Id, nombre y estatus de las sucursales para seleccion y filtrado. |

El listado admite los parametros opcionales `sucursalId` y `estatus`.
Los errores devuelven `{ "message": "..." }`: 400 para datos invalidos,
404 para pacientes inexistentes y 500 para errores internos.

## Registro y edicion

```json
{
  "nombre": "Ana",
  "apellidos": "Rivera",
  "telefono": "6681234567",
  "correo": "ana@example.test",
  "fechaNacimiento": "2000-02-29",
  "genero": null,
  "sucursalId": "00000000-0000-4000-8000-000000000001",
  "estatus": "activo"
}
```

- Nombre y apellidos son obligatorios y admiten hasta 100 caracteres.
- Telefono, correo y genero son opcionales, con limites de 20, 100 y 30 caracteres.
- Los campos opcionales vacios se guardan como NULL.
- La fecha es opcional, debe existir en el calendario y no puede ser futura.
- El correo debe tener un formato valido; no es unico para pacientes.
- La sucursal debe existir y estar activa al registrar o reasignar. Se permite conservar la sucursal actual inactiva al editar otros datos.
- Estatus admite `activo` e `inactivo`.
- El backend toma solamente los campos permitidos: no acepta ids ni fechas de auditoria enviados por el cliente.
- La edicion mantiene el UUID, el historial relacionado y los opcionales omitidos. Nombre y apellidos siguen siendo obligatorios en PUT.
- Para compatibilidad con clientes anteriores, un alta sin sucursal utiliza Matriz; la pantalla siempre envia una sucursal seleccionada.

## Comportamiento de la pantalla

La ficha se vuelve a consultar al abrirla. Al guardar se actualiza el listado
con la respuesta del servidor; no hay guardado simulado. La pantalla muestra
carga, listado vacio, ausencia de coincidencias, confirmacion o errores.
Si falla un guardado, mantiene el formulario abierto y conserva sus valores.
Los envios repetidos quedan bloqueados mientras se guarda.

El cliente HTTP compartido conserva el timeout y la cancelacion de consultas,
y sigue utilizando `VITE_API_URL` como el modulo de usuarios. La navegacion
movil permite entrar y salir de Pacientes. Los formularios modales admiten
teclado, Escape y desplazamiento interno en pantallas pequenas.

## Verificacion

```bash
node --test apps/backend/tests/*.test.mjs apps/frontend/tests/*.test.mjs
npm --workspace apps/frontend run build
```

Se verificaron 31 pruebas, incluyendo consulta, registro, edicion persistida,
filtros, restricciones y regresion del modulo de usuarios. Las pruebas HTTP
retiran solo sus pacientes y sucursales temporales.

En navegador se verificaron alta, ficha, edicion, persistencia tras recargar,
filtros, campos obligatorios, errores de guardado, reintento y Escape contra
la API real. Se revisaron capturas a 1440 y 390 px y el desbordamiento a 320 px.
Los registros temporales de estas comprobaciones se retiran al finalizar.

## Pendientes

- Paginacion coordinada con el backend.
- Reglas de deteccion de posibles pacientes duplicados.
- Historial de estudios en la ficha, cuando se implemente ese flujo.
- Catalogo definitivo de genero.
- Integracion de la sesion y permisos con las rutas de pacientes; estas conservan el acceso actual del proyecto.
