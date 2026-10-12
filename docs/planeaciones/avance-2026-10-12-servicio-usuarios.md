# Avance frontend - 2026-10-12

## Objetivo

Preparar el modulo de usuarios para su futura conexion con la API.

## Actividades realizadas

- Se reviso la pantalla actual de gestion de usuarios.
- Se separaron los datos de prueba de la capa de servicio.
- Se creo un servicio frontend inicial para usuarios.
- Se definieron endpoints esperados para listado, alta, actualizacion y cambio de estado.
- Se preparo una funcion para estructurar el payload del formulario.

## Entregable

Servicio frontend inicial de usuarios preparado para reemplazar datos locales por respuestas del backend.

## Pendientes

- Conectar `GET /usuarios` al listado.
- Conectar `POST /usuarios` al formulario de alta.
- Conectar `PATCH /usuarios/:id` a la edicion de informacion.
- Conectar `PATCH /usuarios/:id/estado` al cambio de estado.
- Agregar manejo de carga y errores al consumir API.

## Evidencia sugerida

- Captura del servicio `usersService.js`.
- Captura de la pantalla de usuarios funcionando despues del cambio.
- Captura del build ejecutado correctamente.
