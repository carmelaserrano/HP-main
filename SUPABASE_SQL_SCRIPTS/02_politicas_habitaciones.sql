-- Script para verificar y configurar políticas de seguridad (RLS) para la tabla habitaciones
-- Esto permite que los operadores y administradores puedan actualizar el estado de las habitaciones

-- 1. Verificar si RLS está habilitado en la tabla habitaciones
-- Ejecuta esto primero para ver el estado actual:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'habitaciones';

-- 2. Si RLS está habilitado y está bloqueando las actualizaciones, necesitamos crear políticas

-- Política para permitir que operadores y administradores actualicen habitaciones
DROP POLICY IF EXISTS "Operadores y admins pueden actualizar habitaciones" ON habitaciones;

CREATE POLICY "Operadores y admins pueden actualizar habitaciones"
ON habitaciones
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.rol IN ('operador', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.rol IN ('operador', 'admin')
  )
);

-- Política para permitir que todos puedan leer habitaciones (necesario para mostrar el mapa)
DROP POLICY IF EXISTS "Todos pueden ver habitaciones" ON habitaciones;

CREATE POLICY "Todos pueden ver habitaciones"
ON habitaciones
FOR SELECT
USING (true);

-- Política para permitir que solo admins puedan insertar nuevas habitaciones
DROP POLICY IF EXISTS "Solo admins pueden insertar habitaciones" ON habitaciones;

CREATE POLICY "Solo admins pueden insertar habitaciones"
ON habitaciones
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.rol = 'admin'
  )
);

-- NOTA: Si después de ejecutar esto sigues teniendo problemas,
-- puedes TEMPORALMENTE deshabilitar RLS en la tabla habitaciones con:
-- ALTER TABLE habitaciones DISABLE ROW LEVEL SECURITY;
-- (NO recomendado para producción, solo para debugging)
