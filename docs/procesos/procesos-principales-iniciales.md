# Procesos principales iniciales

Este documento describe los primeros procesos del sistema de laboratorios. La finalidad es definir los flujos base antes de iniciar el desarrollo completo de los modulos.

## 1. Proceso de autenticacion de usuarios

### Objetivo

Permitir que los usuarios autorizados ingresen al sistema segun su rol y sucursal asignada.

### Actores

- Administrador
- Supervisor
- Operativo
- Recepcion

### Flujo principal

1. El usuario ingresa su correo y contrasena.
2. El sistema valida que los campos sean obligatorios.
3. El sistema verifica que el usuario exista.
4. El sistema valida que el usuario se encuentre activo.
5. El sistema valida las credenciales.
6. El sistema identifica el rol y la sucursal asignada.
7. El usuario accede a las pantallas permitidas segun su rol.

### Validaciones iniciales

- Correo obligatorio.
- Contrasena obligatoria.
- Usuario activo.
- Usuario asignado a una sucursal.
- Rol valido dentro del sistema.

### Resultado esperado

El usuario inicia sesion correctamente y accede solo a las funciones permitidas.

## 2. Proceso de registro de pacientes

### Objetivo

Registrar pacientes en el sistema para poder asociarlos con estudios, pagos e historial medico del laboratorio.

### Actores

- Recepcion
- Supervisor
- Administrador

### Flujo principal

1. El usuario accede al modulo de pacientes.
2. El usuario selecciona la opcion de registrar paciente.
3. El sistema muestra el formulario de datos del paciente.
4. El usuario captura la informacion requerida.
5. El sistema valida los campos obligatorios.
6. El sistema registra al paciente con estatus activo.
7. El sistema permite consultar el expediente e historial del paciente.

### Validaciones iniciales

- Nombre obligatorio.
- Telefono o medio de contacto.
- Evitar registros duplicados cuando sea posible.
- Estatus activo al momento del registro.

### Resultado esperado

El paciente queda registrado y disponible para asociarlo con estudios posteriores.

## 3. Proceso de registro de estudios

### Objetivo

Registrar los estudios realizados a un paciente y conservar su historial dentro del sistema.

### Actores

- Operativo
- Supervisor
- Recepcion

### Flujo principal

1. El usuario busca o selecciona al paciente.
2. El usuario selecciona el servicio o estudio a realizar.
3. El sistema muestra los datos del servicio, costo e insumos requeridos.
4. El sistema valida si existen insumos suficientes.
5. El usuario registra el estudio.
6. El sistema descuenta los insumos correspondientes cuando aplique.
7. El sistema guarda el estudio en el historial del paciente.
8. El estudio queda disponible para consulta o captura de resultado.

### Validaciones iniciales

- Paciente existente y activo.
- Servicio existente y activo.
- Insumos suficientes para realizar el estudio.
- Usuario autorizado para registrar estudios.

### Resultado esperado

El estudio queda registrado, asociado al paciente y preparado para su consulta o seguimiento.

## 4. Proceso de cobro de servicios

### Objetivo

Registrar el pago de los estudios o servicios realizados al paciente.

### Actores

- Recepcion
- Administrador

### Flujo principal

1. El usuario selecciona el estudio o servicio pendiente de pago.
2. El sistema muestra el monto a cobrar.
3. El usuario selecciona el metodo de pago.
4. El sistema registra el pago.
5. El sistema actualiza el estado del estudio o cuenta por cobrar.
6. El movimiento queda disponible para consulta financiera.

### Validaciones iniciales

- Monto valido.
- Metodo de pago seleccionado.
- Servicio asociado a un paciente.
- Cuenta interna disponible para registrar el movimiento.

### Resultado esperado

El pago queda registrado y el estado de cobranza se actualiza correctamente.

## 5. Procesos pendientes para fases posteriores

- Corte de caja.
- Estados de cuenta.
- Reportes administrativos.
- Integracion con equipos medicos.
- Control avanzado de inventario.
- Comparacion de informacion financiera por mes o ano.
