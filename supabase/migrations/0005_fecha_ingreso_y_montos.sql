-- Fecha de ingreso de cada cliente y monto de la cotización.

-- Marcas en los estados (en vez de depender del nombre, que es editable):
--   pide_monto   → al mover un cliente a este estado se exige el monto de la cotización.
--   muestra_suma → el encabezado de la columna muestra la suma de los montos.
alter table public.estados
  add column pide_monto boolean not null default false,
  add column muestra_suma boolean not null default false;

update public.estados set pide_monto = true, muestra_suma = true where nombre = 'Cotización';
update public.estados set muestra_suma = true where nombre = 'Cerró';

-- Fecha de ingreso (hora de México) y monto de la cotización.
alter table public.clientes
  add column fecha_ingreso date not null default ((now() at time zone 'America/Mexico_City')::date),
  add column monto_cotizacion numeric(12, 2) check (monto_cotizacion is null or monto_cotizacion > 0);

-- Los clientes que ya existían se registraron "ayer".
update public.clientes set fecha_ingreso = date '2026-11-11';
