# Revision de consistencia del diccionario de datos

Este documento registra la revision inicial de consistencia del diccionario de datos antes de preparar el diagrama de base de datos.

## Entidades revisadas

- Usuario
- Sucursal
- Paciente
- Estudio
- Servicio
- Pago
- Producto

## Campos comunes

| Campo | Estado | Observacion |
| --- | --- | --- |
| `id` | Incluido | Todas las entidades principales contemplan identificador unico. |
| `createdAt` | Incluido | Todas las entidades principales contemplan fecha de creacion. |
| `updatedAt` | Incluido | Todas las entidades principales contemplan fecha de actualizacion. |
| `estatus` o `estado` | Incluido | Se usa para controlar disponibilidad o avance del registro. |

## Consistencia de tipos

| Tipo | Uso actual | Observacion |
| --- | --- | --- |
| UUID | Identificadores y relaciones | Se mantiene como tipo base para ids principales y foraneos. |
| String | Textos generales | Se usa en nombres, descripciones, correo, telefono y claves. |
| Number | Montos, costos y cantidades | Se usa en valores numericos relacionados con pagos, costos y stock. |
| Date | Fechas funcionales | Se usa en fechas de nacimiento, estudios y pagos. |
| Timestamp | Auditoria | Se usa en `createdAt` y `updatedAt`. |
| Enum | Catalogos | Se usa en roles, estatus, estados, genero y metodo de pago. |

## Observaciones

- `edad` aparece en Usuario y Paciente, pero sigue pendiente definir si se almacena o se calcula.
- `estatus` se utiliza en entidades de catalogo o personas.
- `estado` se utiliza en entidades con flujo operativo, como Estudio y Pago.
- Los ids de relacion estan definidos en las entidades dependientes.
- Los campos financieros requieren validaciones especificas en fases posteriores.

## Ajustes sugeridos para fases posteriores

- Unificar nombres de campos de auditoria segun la convencion del backend.
- Definir catalogos antes de implementar modelos.
- Validar si Pago debe permitir pagos parciales.
- Definir reglas para productos con stock minimo.
- Definir entidades de movimientos antes de implementar inventario y finanzas.
