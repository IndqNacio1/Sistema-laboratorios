# Arquitectura frontend/backend

Este documento define la separacion inicial de responsabilidades entre frontend y backend para el sistema de laboratorios.

## Objetivo

Establecer una base de arquitectura que permita desarrollar los modulos del sistema de forma ordenada, separando presentacion, logica de negocio, servicios y persistencia de datos.

## Frontend

El frontend sera responsable de la interfaz de usuario y la interaccion con los usuarios del sistema.

Tecnologias contempladas:

- React.
- Tailwind CSS.
- MUI.

Responsabilidades iniciales:

- Mostrar pantallas y formularios del sistema.
- Validar campos obligatorios antes de enviar datos a la API.
- Consumir servicios del backend.
- Controlar navegacion por rutas.
- Mostrar mensajes de error, confirmacion y estados vacios.
- Adaptar vistas de acuerdo con el rol del usuario.

Estructura inicial:

- `src/pages`: pantallas principales del sistema.
- `src/components`: componentes reutilizables.
- `src/layouts`: estructuras visuales generales.
- `src/routes`: definicion de rutas del frontend.
- `src/services`: comunicacion con la API.
- `src/styles`: estilos globales.

## Backend

El backend sera responsable de la logica de negocio, validaciones, seguridad, reglas de acceso y comunicacion con base de datos.

Tecnologias contempladas:

- Node.js.
- Express.
- PostgreSQL.
- MongoDB.

Responsabilidades iniciales:

- Exponer endpoints para los modulos del sistema.
- Validar datos recibidos desde el frontend.
- Aplicar reglas de negocio.
- Controlar autenticacion y permisos.
- Conectar con las bases de datos.
- Registrar operaciones importantes para trazabilidad.

Estructura inicial:

- `src/routes`: definicion de endpoints.
- `src/controllers`: entrada de solicitudes y respuestas.
- `src/services`: logica de negocio.
- `src/models`: modelos o entidades de datos.
- `src/middlewares`: autenticacion, permisos y validaciones.
- `src/config`: configuracion general.
- `src/utils`: funciones auxiliares.

## Comunicacion entre frontend y backend

El frontend enviara solicitudes HTTP hacia la API del backend.

Flujo general:

1. El usuario interactua con una pantalla.
2. El frontend valida campos basicos.
3. El frontend envia la solicitud a la API.
4. El backend valida datos y permisos.
5. El backend ejecuta la regla de negocio.
6. El backend consulta o actualiza la base de datos.
7. El backend responde al frontend.
8. El frontend muestra el resultado al usuario.

## Modulos prioritarios

- Autenticacion.
- Usuarios.
- Sucursales.
- Pacientes.
- Servicios.
- Estudios.
- Pagos.
- Productos.

## Criterios iniciales

- Mantener separada la logica de interfaz y la logica de negocio.
- Evitar que el frontend modifique datos sin pasar por validaciones del backend.
- Centralizar reglas de permisos en el backend.
- Mantener la documentacion alineada con las rutas y entidades.
- Preparar la arquitectura para crecer por modulos.
