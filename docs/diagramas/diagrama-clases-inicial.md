# Diagrama inicial de clases

Este diagrama representa una primera version de las entidades principales del sistema de laboratorios. Puede ajustarse conforme se definan con mas detalle los modulos y reglas de negocio.

```mermaid
classDiagram
  class Usuario {
    +String id
    +String nombre
    +String correo
    +String contrasena
    +String rol
    +String estatus
    +Date fechaRegistro
    +iniciarSesion()
    +cerrarSesion()
  }

  class Sucursal {
    +String id
    +String nombre
    +String direccion
    +String telefono
    +String estatus
  }

  class Paciente {
    +String id
    +String nombre
    +String telefono
    +String correo
    +Date fechaNacimiento
    +String estatus
  }

  class Estudio {
    +String id
    +Date fecha
    +String resultado
    +String estado
    +registrarResultado()
    +consultarResultado()
  }

  class Servicio {
    +String id
    +String nombre
    +String descripcion
    +Number costo
    +String estatus
  }

  class MaterialServicio {
    +String id
    +Number cantidadRequerida
  }

  class Producto {
    +String id
    +String nombre
    +String unidadMedida
    +Number stock
    +String estatus
  }

  class MovimientoInventario {
    +String id
    +String tipo
    +Number cantidad
    +Date fecha
    +String motivo
  }

  class Pago {
    +String id
    +Number monto
    +String metodoPago
    +String estado
    +Date fecha
  }

  class Cuenta {
    +String id
    +String nombre
    +String tipo
    +Number saldo
    +String estatus
  }

  class MovimientoFinanciero {
    +String id
    +String tipo
    +String concepto
    +Number monto
    +Date fecha
  }

  Sucursal "1" --> "0..*" Usuario
  Sucursal "1" --> "0..*" Paciente
  Paciente "1" --> "0..*" Estudio
  Servicio "1" --> "0..*" Estudio
  Servicio "1" --> "0..*" MaterialServicio
  Producto "1" --> "0..*" MaterialServicio
  Producto "1" --> "0..*" MovimientoInventario
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

## Pendientes de definicion

- Campos finales de cada entidad.
- Permisos especificos por rol.
- Manejo de cortes de caja.
- Relacion final entre pagos, cuentas por cobrar y estados de cuenta.
- Integracion con equipos medicos.
