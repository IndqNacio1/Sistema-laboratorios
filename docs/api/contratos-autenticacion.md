# Contratos de API - Autenticacion

Este documento define los contratos iniciales de solicitud y respuesta para el modulo de autenticacion. Sirve como referencia para alinear frontend y backend antes de implementar los endpoints definitivos.

## POST /auth/login

Permite iniciar sesion en el sistema.

### Request

```json
{
  "correo": "usuario@laboratorio.com",
  "contrasena": "password_seguro"
}
```

### Validaciones

- `correo` es obligatorio.
- `correo` debe tener formato valido.
- `contrasena` es obligatoria.
- El usuario debe existir.
- El usuario debe estar activo.
- La contrasena debe coincidir con la almacenada.

### Response 200

```json
{
  "token": "jwt_o_token_de_sesion",
  "usuario": {
    "id": "uuid",
    "sucursalId": "uuid",
    "nombres": "Julio Cesar",
    "apellidos": "Lugo Franco",
    "correo": "usuario@laboratorio.com",
    "rol": "administrador",
    "estatus": "activo"
  }
}
```

### Errores esperados

```json
{
  "message": "Correo y contrasena son obligatorios."
}
```

```json
{
  "message": "Credenciales invalidas."
}
```

```json
{
  "message": "El usuario se encuentra inactivo."
}
```

## POST /auth/logout

Permite cerrar la sesion activa del usuario.

### Request

```json
{
  "usuarioId": "uuid"
}
```

### Response 200

```json
{
  "message": "Sesion cerrada correctamente."
}
```

## POST /auth/recover

Permite iniciar el flujo de recuperacion de cuenta.

### Request

```json
{
  "correo": "usuario@laboratorio.com"
}
```

### Validaciones

- `correo` es obligatorio.
- `correo` debe tener formato valido.
- El correo debe pertenecer a un usuario registrado.

### Response 200

```json
{
  "message": "Solicitud de recuperacion registrada."
}
```

## POST /auth/reset-password

Permite actualizar la contrasena despues de una solicitud de recuperacion.

### Request

```json
{
  "token": "token_de_recuperacion",
  "nuevaContrasena": "nuevo_password_seguro"
}
```

### Validaciones

- `token` es obligatorio.
- `nuevaContrasena` es obligatoria.
- El token debe estar vigente.

### Response 200

```json
{
  "message": "Contrasena actualizada correctamente."
}
```

## Pendientes

- Definir reglas finales de seguridad para contrasena.
- Definir tiempo de expiracion del token de sesion.
- Definir tiempo de expiracion del token de recuperacion.
- Definir formato final de errores de API.
