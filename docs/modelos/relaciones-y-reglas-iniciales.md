# Relaciones y reglas iniciales del modelo

Este documento resume las relaciones principales que deben contemplarse en los modelos del sistema. Sirve como complemento del diagrama inicial de clases corregido.

## Relaciones por entidad

### Sucursal

- Una sucursal puede tener varios usuarios.
- Una sucursal puede tener varios pacientes.
- La sucursal permite limitar la informacion que ven los usuarios que no son administradores.

### Usuario

- Un usuario pertenece a una sola sucursal.
- Un usuario puede registrar estudios.
- Un usuario puede atender pagos.
- Un usuario puede realizar movimientos de inventario.
- Un usuario puede realizar movimientos financieros.

### Paciente

- Un paciente pertenece a una sucursal.
- Un paciente puede tener varios estudios.
- El historial del paciente se obtiene a partir de sus estudios registrados.

### Servicio

- Un servicio puede relacionarse con varios estudios.
- Un servicio puede requerir varios productos mediante `MaterialServicio`.
- El costo del servicio se usa como base para el cobro.

### Producto

- Un producto puede utilizarse en varios servicios.
- Un producto puede tener varios movimientos de inventario.
- El stock se actualiza mediante compras, inventario inicial, ajustes o uso en estudios.

### Estudio

- Un estudio pertenece a un paciente.
- Un estudio se relaciona con un servicio.
- Un estudio puede tener un pago asociado.
- Un estudio puede ser registrado o actualizado por un usuario autorizado.

### Pago

- Un pago pertenece a un estudio.
- Un pago debe registrar el usuario que atendio el cobro.
- Un pago puede generar un movimiento financiero.
- El pago contempla monto, monto recibido y cambio devuelto.

### Cuenta

- Una cuenta puede tener varios movimientos financieros.
- Las cuentas representan efectivo o cuentas internas del laboratorio.
- No existe conexion directa con bancos.

### Movimiento financiero

- Un movimiento financiero puede afectar una cuenta.
- Si es transferencia, debe identificar cuenta origen y cuenta destino.
- Debe registrar monto inicial, monto de ajuste y monto final.
- Debe registrar el usuario responsable del movimiento.

## Reglas iniciales

- Los ids principales se manejaran como `UUID`.
- Las entidades principales deben incluir `createdAt` y `updatedAt`.
- Las bajas deben manejarse por estatus cuando aplique.
- Los ids de relacion deben agregarse en los modelos dependientes.
- El historial no debe perderse al inactivar usuarios, pacientes o productos.
- Los movimientos financieros e inventario deben conservar trazabilidad del usuario responsable.

## Dudas pendientes

- Definir si la edad se guardara o se calculara desde fecha de nacimiento.
- Definir catalogos finales para genero, rol, estatus, tipo de movimiento y metodo de pago.
- Definir si un estudio puede tener varios pagos parciales o solo un pago.
- Definir el manejo final de cuentas por cobrar.
- Definir si las fotos de productos se guardaran como URL, archivo o referencia externa.
