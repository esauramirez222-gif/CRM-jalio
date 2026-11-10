-- Esquema de SC-Jalio: estados, clientes, perfiles, RLS y ping.
-- Las listas de medio_contacto y contactado_por deben coincidir con lib/constantes.ts.

-- ───────────── estados ─────────────
create table public.estados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique check (char_length(trim(nombre)) > 0),
  orden int not null,
  color text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now()
);

-- ───────────── clientes ─────────────
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) > 0),
  empresa text,
  celular text,
  correo text,
  giro text,
  estado_id uuid not null references public.estados(id) on delete restrict,
  medio_contacto text check (medio_contacto in ('redes', 'llamada', 'correo')),
  contactado_por text check (contactado_por in ('Monica', 'Jaziel', 'Leonardo', 'Todos')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clientes_estado_id_idx on public.clientes (estado_id);
create index clientes_updated_at_idx on public.clientes (updated_at desc);

create function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger clientes_updated_at
  before update on public.clientes
  for each row execute function public.tocar_updated_at();

-- ───────────── perfiles ─────────────
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null
);

create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ───────────── privilegios ─────────────
-- Explícitos: no depender de los grants por defecto del proyecto.
revoke all on public.estados, public.clientes, public.perfiles from anon;
grant select, insert, update, delete on public.estados, public.clientes to authenticated;
grant select, update on public.perfiles to authenticated;

-- ───────────── RLS ─────────────
alter table public.estados enable row level security;
alter table public.clientes enable row level security;
alter table public.perfiles enable row level security;

create policy "autenticados gestionan estados" on public.estados
  for all to authenticated using (true) with check (true);

create policy "autenticados gestionan clientes" on public.clientes
  for all to authenticated using (true) with check (true);

create policy "autenticados ven perfiles" on public.perfiles
  for select to authenticated using (true);

create policy "cada quien edita su perfil" on public.perfiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ───────────── ping (keep-alive) ─────────────
-- No lee datos de negocio; sólo genera actividad para que el proyecto gratuito no se pause.
create function public.ping()
returns int
language sql
security definer
set search_path = ''
as $$ select 1 $$;

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;
