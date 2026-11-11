-- ⚠️ SCRIPT DE UNA SOLA VEZ (no es migración; no ponerlo en supabase/migrations).
--
-- Hasta el 2026-11-11 el formulario tenía "Nombre" arriba y se capturó ahí el
-- nombre de la EMPRESA, y en "Empresa" el nombre de la PERSONA de contacto.
-- Este script intercambia ambos valores en los clientes creados ANTES del cambio
-- (los nuevos ya se guardan bien), para que todos queden con el mismo significado:
--   empresa = negocio · nombre = persona de contacto
--
-- Sólo afecta filas creadas antes de 2026-11-11 19:10 UTC, así que correrlo
-- dos veces SÍ las volvería a intercambiar: correrlo UNA sola vez.

update public.clientes
set nombre = empresa,
    empresa = nombre
where created_at < '2026-11-11 19:10:00+00';
