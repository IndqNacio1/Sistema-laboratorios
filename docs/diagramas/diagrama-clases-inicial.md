# Diagrama inicial de clases

Este diagrama representa una primera version corregida de las entidades principales del sistema de laboratorios. Se agregan campos de auditoria, identificadores de relacion y ajustes derivados de las observaciones recibidas.

```mermaid
classDiagram
  class Usuario {
    +UUID id
    +UUID sucursalId
    +String nombres
    +String apellidos
    +String correo
    +String contrasena
    +String rol
    +Date fechaNacimiento
    +Int edad
    +String genero
    +String estatus
    +Timestamp createdAt
    +Timestamp updatedAt
    +iniciarSesion()
    +cerrarSesion()
  }

  class Sucursal {
    +UUID id
    +String nombre
    +String direccion
    +String telefono
    +String estatus
    +Timestamp createdAt
    +Timestamp updatedAt
    +Timestamp expiresAt
  }

  class Paciente {
    +UUID id
    +UUID sucursalId
    +String nombres
    +String apellidos
    +String telefono
    +String correo
    +Date fechaNacimiento
    +Int edad
    +String genero
    +String estatus
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  class Estudio {
    +UUID id
    +UUID pacienteId
    +UUID servicioId
    +UUID usuarioId
    +Date fecha
    +String resultado
    +String estado
    +Timestamp createdAt
    +Timestamp updatedAt
    +registrarResultado()
    +consultarResultado()
  }

  class Servicio {
    +UUID id
    +String nombre
    +String descripcion
    +Number costo
    +String estatus
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  class MaterialServicio {
    +UUID id
    +UUID servicioId
    +UUID productoId
    +Number cantidadRequerida
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  class Producto {
    +UUID id
    +String nombre
    +String codigoBarras
    +String clave
    +String unidadMedida
    +Number stock
    +Number stockMinimo
    +String foto
    +String estatus
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  class MovimientoInventario {
    +UUID id
    +UUID productoId
    +UUID usuarioId
    +String tipo
    +Number cantidad
    +Date fecha
    +String motivo
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  class Pago {
    +UUID id
    +UUID estudioId
    +UUID usuarioId
    +Number monto
    +Number montoRecibido
    +Number cambioDevuelto
    +String metodoPago
    +String estado
    +Date fecha
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  class Cuenta {
    +UUID id
    +String nombre
    +String tipo
    +Number saldo
    +String estatus
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  class MovimientoFinanciero {
    +UUID id
    +UUID cuentaId
    +UUID cuentaOrigenId
    +UUID cuentaDestinoId
    +UUID pagoId
    +UUID usuarioId
    +String tipo
    +String concepto
    +Number monto
    +Number montoInicial
    +Number montoAjuste
    +Number montoFinal
    +Date fecha
    +Timestamp createdAt
    +Timestamp updatedAt
  }

  Sucursal "1" --> "0..*" Usuario
  Sucursal "1" --> "0..*" Paciente
  Paciente "1" --> "0..*" Estudio
  Servicio "1" --> "0..*" Estudio
  Servicio "1" --> "0..*" MaterialServicio
  Producto "1" --> "0..*" MaterialServicio
  Producto "1" --> "0..*" MovimientoInventario
  Usuario "1" --> "0..*" MovimientoInventario
  Usuario "1" --> "0..*" Estudio
  Usuario "1" --> "0..*" Pago
  Usuario "1" --> "0..*" MovimientoFinanciero
  Estudio "1" --> "0..1" Pago
  Cuenta "1" --> "0..*" MovimientoFinanciero
  Pago "1" --> "1" MovimientoFinanciero
```

## Entidades principales

- `Usuario`: persona que accede al sistema segun su rol.
- `Sucursal`: unidad del laboratorio a la que pertenecen usuarios y operaciones.
- `Paciente`: persona a la que se le realizan estudios.
- `Estudio`: registro de un estudio realizado a un paciente.
- `Servicio`: catalogo de estudios o servicios que ofrece el laboratorio.
- `Producto`: insumo utilizado para realizar servicios.
- `Pago`: registro del cobro de un estudio o servicio.
- `Cuenta`: cuenta interna de efectivo o banco para controlar movimientos.
- `MovimientoFinanciero`: ingreso, egreso, ajuste o transferencia entre cuentas.

## Correcciones aplicadas

- Se considera `UUID` para los identificadores principales.
- Se agregan campos `createdAt` y `updatedAt` en las entidades principales.
- Se agregan ids de relacion en los modelos que dependen de otras entidades.
- Se separan nombres y apellidos en `Usuario` y `Paciente`.
- Se agregan `fechaNacimiento`, `edad` y `genero` en `Usuario` y `Paciente`.
- Se agregan `codigoBarras`, `clave`, `stockMinimo` y `foto` en `Producto`.
- Se agregan `montoRecibido`, `cambioDevuelto` y `usuarioId` en `Pago`.
- Se ajusta `MovimientoFinanciero` para contemplar cuenta afectada, transferencia entre cuentas, montos iniciales/finales y usuario responsable.

## Pendientes de definicion

- Permisos especificos por rol.
- Manejo de cortes de caja.
- Relacion final entre pagos, cuentas por cobrar y estados de cuenta.
- Integracion con equipos medicos.
- Definir si `edad` se guardara como campo o se calculara a partir de `fechaNacimiento`.
- Definir catalogos finales para `genero`, `rol`, `estatus`, `tipo` y `metodoPago`.
