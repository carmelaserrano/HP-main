-- Script para crear el tipo enum de estados de habitaciones
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Primero, crear el tipo enum si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_habitacion') THEN
        CREATE TYPE estado_habitacion AS ENUM (
            'disponible',
            'ocupada',
            'reservada',
            'mantenimiento'
        );
    END IF;
END $$;

-- 2. Alterar la columna para usar el enum (SOLO si es necesario)
-- CUIDADO: Esto puede fallar si ya tienes valores que no coinciden
-- ALTER TABLE habitaciones
-- ALTER COLUMN estado TYPE estado_habitacion
-- USING estado::estado_habitacion;

-- 3. Si prefieres mantener tipo TEXT pero agregar una restricción:
-- Esto permite validar que solo se usen ciertos valores
ALTER TABLE habitaciones
DROP CONSTRAINT IF EXISTS check_estado_valido;

ALTER TABLE habitaciones
ADD CONSTRAINT check_estado_valido
CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'mantenimiento'));

-- Verificar que funcionó
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'habitaciones'
AND column_name = 'estado';
