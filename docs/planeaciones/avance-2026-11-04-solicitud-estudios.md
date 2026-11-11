# Avance de solicitud de estudios

Este documento describe el borrador inicial del 4 de noviembre. El guardado
posterior se documenta en [Integracion de solicitudes](../api/integracion-solicitudes-estudios.md).

La pantalla `/solicitudes-estudios` consulta los pacientes y servicios existentes.
Permite buscar un paciente por nombre, seleccionar registros activos y revisar
el costo del servicio antes de preparar un borrador. La revision permite volver
al formulario conservando la seleccion.

El borrador vive en memoria y se pierde al recargar. No se envia una peticion
de escritura ni se registra una solicitud clinica. `/api/estudios` sigue
siendo un alias del catalogo de servicios.

## Contrato propuesto

`POST /api/solicitudes-estudios` recibiria `pacienteId` y `servicioId`.
El backend debe resolver el usuario desde la sesion, comprobar sus permisos
y el alcance de su sucursal, verificar que el paciente y el servicio sigan
activos y guardar el estudio con estado pendiente. El costo mostrado en el
formulario es informativo: el backend debe consultar el importe autorizado
y definir como conservarlo para el cobro.

El modelo `EstudioPaciente` ya representa el registro clinico y sus relaciones.
Quedan pendientes el controlador, la ruta protegida, la persistencia y las
pruebas del alta real. No se cambia el modelo SQL en este avance.

## Verificacion

Pasaron las 60 pruebas y la compilacion del frontend. En navegador se
comprobaron el reintento ante errores, la busqueda, los campos obligatorios,
el costo y la edicion del borrador, con respuestas controladas y vistas de
escritorio y movil. Se verifico que la pantalla solo enviara consultas GET.
