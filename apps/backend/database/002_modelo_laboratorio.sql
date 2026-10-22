BEGIN;

DO $$
BEGIN
    IF current_database() <> 'laboratorio_db' THEN
        RAISE EXCEPTION 'Ejecuta este script solamente en laboratorio_db';
    END IF;
END;
$$;

CREATE SCHEMA laboratorio;
SET LOCAL search_path TO laboratorio, pg_catalog;

CREATE TABLE schema_migrations (
    version varchar(100) PRIMARY KEY,
    applied_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sucursales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(100) NOT NULL UNIQUE,
    direccion text NOT NULL,
    telefono varchar(20),
    estatus varchar(10) NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo')),
    expires_at timestamp,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sucursales (id, nombre, direccion)
VALUES ('00000000-0000-4000-8000-000000000001', 'Matriz', 'Pendiente de configurar');

CREATE TABLE usuarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sucursal_id uuid NOT NULL DEFAULT '00000000-0000-4000-8000-000000000001' REFERENCES sucursales(id),
    nombres varchar(100) NOT NULL,
    apellidos varchar(100) NOT NULL DEFAULT '',
    correo varchar(100) NOT NULL,
    contrasena_hash varchar(255) NOT NULL,
    rol varchar(20) NOT NULL DEFAULT 'recepcion' CHECK (rol IN ('administrador', 'supervisor', 'recepcion', 'operativo')),
    fecha_nacimiento date,
    genero varchar(30),
    estatus varchar(10) NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo')),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX usuarios_correo_unico ON usuarios (lower(correo));

CREATE TABLE pacientes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sucursal_id uuid NOT NULL DEFAULT '00000000-0000-4000-8000-000000000001' REFERENCES sucursales(id),
    nombres varchar(100) NOT NULL,
    apellidos varchar(100) NOT NULL,
    telefono varchar(20),
    correo varchar(100),
    fecha_nacimiento date,
    genero varchar(30),
    estatus varchar(10) NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo')),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(150) NOT NULL,
    descripcion text,
    costo numeric(12,2) NOT NULL CHECK (costo >= 0),
    estatus varchar(10) NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo')),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(150) NOT NULL,
    codigo_barras varchar(100) UNIQUE,
    clave varchar(100) UNIQUE,
    unidad_medida varchar(50) NOT NULL,
    stock numeric(12,3) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo numeric(12,3) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    foto text,
    estatus varchar(10) NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo')),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materiales_servicio (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id uuid NOT NULL REFERENCES servicios(id),
    producto_id uuid NOT NULL REFERENCES productos(id),
    cantidad_requerida numeric(12,3) NOT NULL CHECK (cantidad_requerida > 0),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (servicio_id, producto_id)
);

CREATE TABLE estudios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id uuid NOT NULL REFERENCES pacientes(id),
    servicio_id uuid NOT NULL REFERENCES servicios(id),
    usuario_id uuid NOT NULL REFERENCES usuarios(id),
    fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resultado text,
    estado varchar(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimientos_inventario (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id uuid NOT NULL REFERENCES productos(id),
    usuario_id uuid NOT NULL REFERENCES usuarios(id),
    tipo varchar(10) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad numeric(12,3) NOT NULL CHECK (cantidad <> 0),
    fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo text NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (tipo = 'ajuste' OR cantidad > 0)
);

CREATE TABLE pagos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id uuid NOT NULL UNIQUE REFERENCES estudios(id),
    usuario_id uuid NOT NULL REFERENCES usuarios(id),
    monto numeric(12,2) NOT NULL CHECK (monto >= 0),
    monto_recibido numeric(12,2) CHECK (monto_recibido >= 0),
    cambio_devuelto numeric(12,2) NOT NULL DEFAULT 0 CHECK (cambio_devuelto >= 0),
    metodo_pago varchar(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'mixto')),
    estado varchar(10) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'parcial', 'cancelado')),
    fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cuentas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(100) NOT NULL,
    tipo varchar(20) NOT NULL CHECK (tipo IN ('efectivo', 'banco', 'interna')),
    saldo numeric(12,2) NOT NULL DEFAULT 0,
    estatus varchar(10) NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo')),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimientos_financieros (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_id uuid REFERENCES cuentas(id),
    cuenta_origen_id uuid REFERENCES cuentas(id),
    cuenta_destino_id uuid REFERENCES cuentas(id),
    pago_id uuid REFERENCES pagos(id),
    usuario_id uuid NOT NULL REFERENCES usuarios(id),
    tipo varchar(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso', 'ajuste', 'transferencia')),
    concepto text NOT NULL,
    monto numeric(12,2) NOT NULL CHECK (monto >= 0),
    monto_inicial numeric(12,2) NOT NULL,
    monto_ajuste numeric(12,2) NOT NULL,
    monto_final numeric(12,2) NOT NULL,
    saldo_destino_inicial numeric(12,2),
    saldo_destino_final numeric(12,2),
    fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (monto_final = monto_inicial + monto_ajuste),
    CHECK ((tipo = 'ingreso' AND monto_ajuste = monto)
        OR (tipo IN ('egreso', 'transferencia') AND monto_ajuste = -monto)
        OR (tipo = 'ajuste' AND abs(monto_ajuste) = monto)),
    CHECK (
      (tipo = 'transferencia' AND cuenta_id IS NULL AND cuenta_origen_id IS NOT NULL
       AND cuenta_destino_id IS NOT NULL AND cuenta_origen_id <> cuenta_destino_id
       AND monto_ajuste = -monto AND saldo_destino_inicial IS NOT NULL
       AND saldo_destino_final IS NOT NULL AND saldo_destino_final = saldo_destino_inicial + monto)
      OR
      (tipo <> 'transferencia' AND cuenta_id IS NOT NULL
       AND cuenta_origen_id IS NULL AND cuenta_destino_id IS NULL
       AND saldo_destino_inicial IS NULL AND saldo_destino_final IS NULL)
    )
);

INSERT INTO usuarios (id, nombres, correo, contrasena_hash, rol, created_at, updated_at)
SELECT id, nombre, correo, password,
       CASE WHEN rol = 'recepcionista' THEN 'recepcion' ELSE rol END, created_at, updated_at
FROM public.usuarios;
INSERT INTO pacientes (id, nombres, apellidos, telefono, created_at, updated_at)
SELECT id, nombre, apellidos, telefono, created_at, updated_at FROM public.pacientes;
INSERT INTO servicios (id, nombre, descripcion, costo, created_at, updated_at)
SELECT id, nombre, descripcion, precio, created_at, updated_at FROM public.estudios;
INSERT INTO productos (id, nombre, stock, unidad_medida, created_at, updated_at)
SELECT id, articulo, cantidad, unidad_medida, created_at, updated_at FROM public.inventario;

CREATE FUNCTION actualizar_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    tabla text;
    relacion record;
BEGIN
    FOREACH tabla IN ARRAY ARRAY['sucursales','usuarios','pacientes','servicios','productos',
      'materiales_servicio','estudios','movimientos_inventario','pagos','cuentas','movimientos_financieros']
    LOOP
        EXECUTE format('CREATE TRIGGER auditar_actualizacion BEFORE UPDATE ON laboratorio.%I FOR EACH ROW EXECUTE FUNCTION laboratorio.actualizar_updated_at()', tabla);
    END LOOP;
    FOR relacion IN
        SELECT t.relname AS tabla, a.attname AS columna
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
        WHERE c.contype = 'f' AND n.nspname = 'laboratorio'
    LOOP
        EXECUTE format('CREATE INDEX ON laboratorio.%I (%I)', relacion.tabla, relacion.columna);
    END LOOP;
END;
$$;

INSERT INTO schema_migrations (version) VALUES ('002_modelo_laboratorio');

COMMIT;
