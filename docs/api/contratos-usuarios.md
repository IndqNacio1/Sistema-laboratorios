# Contratos de API - Usuarios

Este documento define los contratos iniciales para la gestion de usuarios. No representa implementacion final, solo una base para alinear frontend, backend y reglas de negocio.

## GET /usuarios

Consulta usuarios registrados.

### Query params sugeridos

```text
sucursalId=uuid
rol=administrador
estatus=activo
```

### Response 200

```json
{
  "data": [
    {
      "id": "uuid",
      "sucursalId": "uuid",
      "nombres": "Julio Cesar",
      "apellidos": "Lugo Franco",
      "correo": "usuario@laboratorio.com",
      "rol": "recepcion",
      "estatus": "activo"
    }
  ]
}
```

## GET /usuarios/:id

Consulta un usuario por identificador.

### Response 200

```json
{
  "id": "uuid",
  "sucursalId": "uuid",
  "nombres": "Julio Cesar",
  "apellidos": "Lugo Franco",
  "correo": "usuario@laboratorio.com",
  "rol": "recepcion",
  "fechaNacimiento": "2000-01-01",
  "edad": 26,
  "genero": "masculino",
  "estatus": "activo",
  "createdAt": "2026-09-29T12:00:00.000Z",
  "updatedAt": "2026-09-29T12:00:00.000Z"
}
```

## POST /usuarios

Crea un usuario en la plataforma.

### Request

```json
{
  "sucursalId": "uuid",
  "nombres": "Julio Cesar",
  "apellidos": "Lugo Franco",
  "correo": "usuario@laboratorio.com",
  "contrasena": "password_seguro",
  "rol": "recepcion",
  "fechaNacimiento": "2000-01-01",
  "genero": "masculino"
}
```

### Validaciones

- `sucursalId` es obligatorio.
- `nombres` es obligatorio.
- `apellidos` es obligatorio.
- `correo` es obligatorio y unico.
- `contrasena` es obligatoria.
- `rol` debe pertenecer al catalogo permitido.
- La sucursal debe existir y estar activa.

### Response 201

```json
{
  "id": "uuid",
  "message": "Usuario creado correctamente."
}
```

## PUT /usuarios/:id

Actualiza la informacion editable de un usuario.

### Request

```json
{
  "sucursalId": "uuid",
  "nombres": "Julio Cesar",
  "apellidos": "Lugo Franco",
  "correo": "usuario@laboratorio.com",
  "rol": "supervisor",
  "fechaNacimiento": "2000-01-01",
  "genero": "masculino"
}
```

### Validaciones

- No permitir correos duplicados.
- No permitir roles inexistentes.
- No permitir sucursales inactivas.
- Solo administrador puede cambiar sucursal de otros usuarios.

### Response 200

```json
{
  "message": "Usuario actualizado correctamente."
}
```

## PATCH /usuarios/:id/estatus

Cambia el estatus del usuario sin eliminarlo fisicamente.

### Request

```json
{
  "estatus": "inactivo"
}
```

### Validaciones

- `estatus` debe pertenecer al catalogo permitido.
- Un usuario inactivo no puede iniciar sesion.
- La baja debe conservar el historial del usuario.

### Response 200

```json
{
  "message": "Estatus de usuario actualizado correctamente."
}
```

## Catalogos iniciales

### Roles

- administrador
- supervisor
- operativo
- recepcion

### Estatus

- activo
- inactivo

## Errores esperados

```json
{
  "message": "El correo ya se encuentra registrado."
}
```

```json
{
  "message": "No tienes permisos para realizar esta accion."
}
```

```json
{
  "message": "La sucursal seleccionada no esta disponible."
}
```
