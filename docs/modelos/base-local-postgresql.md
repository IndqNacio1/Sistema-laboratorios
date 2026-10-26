# Base local del laboratorio

## Modelo

La base `laboratorio_db` utiliza el esquema `laboratorio` para las once entidades
del diagrama: sucursales, usuarios, pacientes, servicios, productos,
materiales_servicio, estudios, movimientos_inventario, pagos, cuentas y
movimientos_financieros. `schema_migrations` registra la version instalada.

Las cinco tablas iniciales de `public` se conservan como respaldo de la etapa
anterior. La migracion copia usuarios, pacientes, catalogo de servicios y
productos manteniendo sus UUID. No se borran ni se duplican datos en ejecuciones
posteriores. El backend deja de escribir en esas cuatro tablas antiguas.
`public.ventas` sigue disponible para la ruta anterior de ventas, hasta definir
su sustitucion por el flujo de estudios y pagos.

## Decisiones del esquema

- UUID, claves foraneas restrictivas, indices para las relaciones y auditoria de altas y modificaciones.
- Los estudios realizados pertenecen obligatoriamente a paciente, servicio y usuario.
- El catalogo de servicios se separa de los estudios clinicos.
- Usuarios y pacientes pertenecen a una sucursal. Matriz es la asignacion inicial para mantener la compatibilidad; su direccion debe configurarse.
- Nombres y apellidos separados. Los apellidos de usuarios anteriores quedan vacios: no se infieren a partir de un nombre completo.
- La edad se calcula desde fecha de nacimiento; no se guarda un valor que envejezca.
- Dinero en NUMERIC(12,2), cantidades de inventario en NUMERIC(12,3).
- Correo de usuario unico sin distinguir mayusculas. Contrasenas almacenadas como hash, excluidas de consultas normales de TypeORM.
- Material por servicio sin duplicar el mismo producto; cantidades requeridas positivas y stock no negativo.
- Un pago por estudio, conforme a la cardinalidad actual del diagrama. El detalle de varios metodos de pago y pagos parciales multiples queda pendiente de definir.
- Transferencias identifican cuentas origen y destino diferentes, saldos iniciales y finales de ambas. Los importes deben ser aritmeticamente consistentes.
- Las bajas se representan con estatus. No hay borrado en cascada del historial.

El esquema valida relaciones e importes. Registrar un movimiento todavia no
descuenta inventario ni modifica saldos automaticamente: esos flujos requieren
servicios transaccionales con bloqueo de filas en una fase posterior.

## Instalacion y conexion

Crear `laboratorio_db` en PostgreSQL. Configurar `apps/backend/.env` con los
nombres de variables de `apps/backend/.env.example`. `DB_PASSWORD` es la
contrasena del usuario de PostgreSQL, no la de acceso a pgAdmin. El archivo
`.env` esta ignorado por Git. No guardar credenciales en la plantilla.

Desde la raiz:

```bash
npm --workspace apps/backend run db:migrate
npm run dev:backend
npm run dev:frontend
```

El comando instala la base inicial si hace falta, aplica
`002_modelo_laboratorio.sql` de forma transaccional y registra su version.
Si ya esta instalada, no vuelve a copiar datos. Tambien genera un secreto JWT
local si falta uno suficientemente largo.

TypeORM carga explicitamente los modelos y lee `.env` desde el directorio
backend aunque se ejecute desde otra carpeta. `synchronize` permanece
desactivado. El servidor solo abre su puerto cuando PostgreSQL y el esquema
estan disponibles; `/api/health` consulta la conexion real y devuelve 503
cuando no esta disponible.

## Compatibilidad de rutas existentes

| Ruta | Destino |
| --- | --- |
| /api/usuarios | laboratorio.usuarios |
| /api/pacientes | laboratorio.pacientes |
| /api/estudios | laboratorio.servicios, catalogo anterior |
| /api/inventarios | laboratorio.productos |
| /api/ventas | public.ventas, compatibilidad temporal |

El modelo `EstudioPaciente` representa estudios clinicos reales; aun no tiene
un controlador propio. La ruta antigua `/api/estudios` conserva su contrato de
catalogo para no confundir altas de servicios con estudios de pacientes.
Los adaptadores mantienen `nombre`, `password`, `precio`, `articulo` y `cantidad`
en el codigo existente y los mapean a las columnas del esquema nuevo.

## Verificacion

```bash
node --test apps/backend/tests/database.test.mjs apps/backend/tests/users-api.test.mjs
node --test apps/frontend/tests/usersService.test.mjs
```

La prueba de base utiliza una transaccion y revierte sus registros temporales.
Comprueba los once modelos, relaciones, correo unico, stock, pagos y
exclusion del hash. En pgAdmin: `laboratorio_db > Schemas > laboratorio > Tables`.

Verificacion local completada: 13 pruebas de PostgreSQL y API aprobadas,
consulta y registro de usuarios persistidos, login JWT y health 200. La
segunda ejecucion de la migracion detecto la version instalada sin repetirla.

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'laboratorio' ORDER BY table_name;
SELECT * FROM laboratorio.schema_migrations;
```
