# Preparacion para diagrama de base de datos

Este documento resume las entidades, relaciones y tablas pendientes que se usaran como base para el diagrama de base de datos de la siguiente etapa.

## Entidades documentadas

- Usuario
- Sucursal
- Paciente
- Estudio
- Servicio
- Pago
- Producto

## Relaciones directas

| Relacion | Campo propuesto | Descripcion |
| --- | --- | --- |
| Sucursal -> Usuario | `Usuario.sucursalId` | Una sucursal puede tener varios usuarios. |
| Sucursal -> Paciente | `Paciente.sucursalId` | Una sucursal puede registrar varios pacientes. |
| Paciente -> Estudio | `Estudio.pacienteId` | Un paciente puede tener varios estudios. |
| Servicio -> Estudio | `Estudio.servicioId` | Un estudio se basa en un servicio del catalogo. |
| Usuario -> Estudio | `Estudio.usuarioId` | Un usuario registra o atiende un estudio. |
| Estudio -> Pago | `Pago.estudioId` | Un pago pertenece a un estudio. |
| Usuario -> Pago | `Pago.usuarioId` | Un usuario atiende el cobro. |

## Relaciones que requieren tabla intermedia

| Relacion | Tabla sugerida | Motivo |
| --- | --- | --- |
| Servicio -> Producto | MaterialServicio | Un servicio puede requerir varios productos y un producto puede usarse en varios servicios. |
| Producto -> Inventario | MovimientoInventario | El stock debe cambiar mediante movimientos, no desde el catalogo. |
| Cuenta -> Movimiento financiero | MovimientoFinanciero | Los ingresos, egresos, ajustes y transferencias deben conservar historial. |

## Entidades pendientes

### MaterialServicio

Entidad intermedia para indicar que productos requiere cada servicio.

Campos iniciales sugeridos:

- `id`
- `servicioId`
- `productoId`
- `cantidadRequerida`
- `createdAt`
- `updatedAt`

### MovimientoInventario

Entidad para registrar entradas, salidas y ajustes de productos.

Campos iniciales sugeridos:

- `id`
- `productoId`
- `usuarioId`
- `tipo`
- `cantidad`
- `fecha`
- `motivo`
- `createdAt`
- `updatedAt`

### MovimientoFinanciero

Entidad para registrar ingresos, egresos, ajustes y transferencias entre cuentas.

Campos iniciales sugeridos:

- `id`
- `cuentaId`
- `cuentaOrigenId`
- `cuentaDestinoId`
- `pagoId`
- `usuarioId`
- `tipo`
- `concepto`
- `monto`
- `montoInicial`
- `montoAjuste`
- `montoFinal`
- `fecha`
- `createdAt`
- `updatedAt`

## Notas para la siguiente etapa

- Confirmar si un estudio puede tener varios pagos parciales.
- Confirmar si `edad` se almacenara o se calculara desde `fechaNacimiento`.
- Definir catalogos para roles, generos, estatus, metodos de pago y tipos de movimiento.
- Validar si los campos de auditoria seran `createdAt` y `updatedAt` o `created_at` y `updated_at`.
- Definir si la base principal sera PostgreSQL para estas entidades.
