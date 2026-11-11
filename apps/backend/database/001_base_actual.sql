BEGIN;

DO $$
BEGIN
    IF current_database() <> 'laboratorio_db' THEN
        RAISE EXCEPTION 'Ejecuta este script solamente en laboratorio_db';
    END IF;
END;
$$;

SET LOCAL search_path TO public, pg_catalog;

CREATE TABLE usuarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(100) NOT NULL,
    correo varchar(100) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    rol varchar(50) NOT NULL DEFAULT 'recepcionista',
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pacientes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(100) NOT NULL,
    apellidos varchar(100) NOT NULL,
    telefono varchar(20),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estudios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(150) NOT NULL,
    descripcion text,
    precio numeric(10, 2) NOT NULL CHECK (precio >= 0),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventario (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    articulo varchar(150) NOT NULL,
    cantidad integer NOT NULL CHECK (cantidad >= 0),
    unidad_medida varchar(50) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ventas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    total numeric(10, 2) NOT NULL CHECK (total >= 0),
    estado varchar(50) NOT NULL DEFAULT 'pagado',
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE FUNCTION actualizar_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER pacientes_updated_at BEFORE UPDATE ON pacientes
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER estudios_updated_at BEFORE UPDATE ON estudios
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER inventario_updated_at BEFORE UPDATE ON inventario
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER ventas_updated_at BEFORE UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

COMMIT;
