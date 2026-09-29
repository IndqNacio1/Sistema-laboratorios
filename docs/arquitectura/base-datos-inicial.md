# Base de datos inicial PostgreSQL y MongoDB

Este documento define criterios iniciales para organizar la informacion del sistema entre PostgreSQL y MongoDB.

## Objetivo

Preparar la documentacion base para el futuro diseno de base de datos, separando datos sensibles, transaccionales y relacionales de informacion flexible o complementaria.

## PostgreSQL

PostgreSQL se contempla para informacion estructurada, sensible o transaccional.

Entidades iniciales sugeridas:

- Usuario.
- Sucursal.
- Paciente.
- Servicio.
- Estudio.
- Pago.
- Producto.
- MaterialServicio.
- MovimientoInventario.
- MovimientoFinanciero.

Motivos:

- Requieren relaciones claras entre entidades.
- Necesitan integridad referencial.
- Contienen informacion sensible o administrativa.
- Requieren consultas por fechas, estados, usuarios y sucursales.
- Deben conservar consistencia para cobros, inventario y reportes.

## MongoDB

MongoDB se contempla para informacion flexible, historiales extendidos o datos que puedan variar con el tiempo.

Posibles usos en fases posteriores:

- Bitacoras de actividad.
- Respuestas o resultados extensos de estudios.
- Configuraciones flexibles de reportes.
- Adjuntos o referencias complementarias.
- Datos generados por integraciones con equipos medicos.

## Criterios de separacion

| Criterio | PostgreSQL | MongoDB |
| --- | --- | --- |
| Datos sensibles | Si | Solo si no requieren relacion estricta. |
| Datos con relaciones fuertes | Si | No recomendado. |
| Transacciones financieras | Si | No recomendado. |
| Catalogos principales | Si | No recomendado. |
| Historial flexible | Puede aplicar | Si. |
| Datos variables por integracion | Puede aplicar | Si. |

## Reglas iniciales

- Los datos principales del sistema deben iniciar en PostgreSQL.
- MongoDB se usara solo cuando exista una necesidad clara de flexibilidad.
- Los pagos, pacientes, usuarios y estudios deben mantenerse en PostgreSQL.
- Los documentos o resultados extensos pueden evaluarse para MongoDB.
- Las decisiones finales deben validarse antes de implementar modelos.

## Pendientes

- Definir diagrama relacional inicial.
- Definir llaves primarias y foraneas.
- Definir indices iniciales.
- Definir catalogos para enums.
- Definir si los resultados de estudios se almacenaran completos en PostgreSQL o como documento flexible.
