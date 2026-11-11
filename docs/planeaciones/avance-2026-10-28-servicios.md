# Avance del catalogo de servicios

- Pantalla de servicios con listado, busqueda y filtro por estado.
- Formularios de registro y edicion con validaciones de nombre, descripcion y costo.
- Consulta individual antes de editar y guardado real en PostgreSQL.
- Ruta `/api/servicios` y compatibilidad con el catalogo anterior `/api/estudios`.
- Control de campos permitidos y costos con precision de dos decimales.
- Mensajes de carga, confirmacion, error y reintento, conservando los datos ante fallos de guardado.
- Pruebas de API y servicio frontend y revision visual en escritorio y movil.
- Verificacion final: 43 pruebas aprobadas y compilacion del frontend correcta.

Pendiente: materiales por servicio, integracion con solicitudes de estudios,
paginacion y permisos.
