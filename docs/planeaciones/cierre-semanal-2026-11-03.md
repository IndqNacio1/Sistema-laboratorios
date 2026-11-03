# Cierre de pacientes, servicios y sucursales

Verificacion realizada el 3 de noviembre de 2026.

- Una sucursal activa registrada por la API aparece en el formulario de pacientes y se puede asignar en un alta.
- Al inactivar la sucursal, el formulario bloquea nuevas asignaciones y la API rechaza el alta con estado 400.
- Un paciente ya asociado conserva su sucursal y puede actualizar sus otros datos.
- Las pruebas de API de pacientes, servicios y sucursales verifican registro, edicion, filtros y persistencia en PostgreSQL.

## Resultados

Pasaron las 56 pruebas y la compilacion del frontend. Se comprobo en
navegador el flujo de sucursales y pacientes usando la API real. Los datos
temporales se retiraron al terminar. No se detectaron fallos que requirieran
modificar la aplicacion en esta revision.

```bash
node --test apps/backend/tests/*.test.mjs apps/frontend/tests/*.test.mjs
npm --workspace apps/frontend run build
```

## Pendientes

- Integrar la sesion y los permisos de acceso a los modulos.
- Revisar la paginacion y la deteccion de pacientes duplicados.
- Vincular el catalogo de servicios con la solicitud y el historial de estudios.
