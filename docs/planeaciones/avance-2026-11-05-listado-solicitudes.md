# Listado de solicitudes de estudios - 5 de noviembre de 2026

## Avance

- Consulta autenticada de solicitudes guardadas en PostgreSQL.
- Listado con folio, paciente, servicio, fecha y estado.
- Busqueda por paciente, servicio o folio y filtro por estado.
- Paginacion de 20 registros y boton Actualizar.
- Consulta limitada a la sucursal actual del paciente para recepcion,
  operativo y supervisor; administrador consulta todas.
- Navegacion desde login y menu al listado, alta desde Nueva solicitud
  y regreso desde el formulario con Ver solicitudes.
- Estados de carga, vacio, error, reintento y sesion vencida.

## Verificacion

- 76 pruebas automatizadas aprobadas de backend y servicios frontend.
- Compilacion de produccion del frontend aprobada.
- Navegador con API y PostgreSQL reales: login, alta, listado y recarga
  sin perder la solicitud; busqueda, filtro, vacio, fallo y reintento.
- Supervisor puede consultar, sin enlace de alta en el listado.
- Revision en escritorio y movil; sin errores de React ni desbordamiento
  horizontal de la pagina. La tabla permite desplazamiento interno.
- Datos temporales de las pruebas retirados al finalizar.

## Pendientes

- Ficha detallada y seguimiento de estados.
- Idempotencia del registro y definicion de precio historico.
- Proteccion de los endpoints anteriores de administracion.
- Cobros, inventario y auditoria del flujo.

Cambios locales preparados sin crear commits ni hacer push.
