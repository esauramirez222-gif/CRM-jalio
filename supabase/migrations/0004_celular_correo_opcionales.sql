-- Celular y correo pasan a ser opcionales (pueden quedar vacíos = null).
-- Empresa y giro siguen siendo obligatorios y no vacíos.
alter table public.clientes
  alter column celular drop not null,
  alter column correo drop not null,
  drop constraint clientes_textos_no_vacios,
  add constraint clientes_textos_no_vacios check (
    char_length(trim(empresa)) > 0
    and char_length(trim(giro)) > 0
    and (celular is null or char_length(trim(celular)) > 0)
    and (correo is null or char_length(trim(correo)) > 0)
  );
