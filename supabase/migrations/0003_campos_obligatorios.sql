-- Todos los campos del cliente son obligatorios.
-- Falla si ya hay clientes con algún campo vacío: completarlos antes de aplicarla.
alter table public.clientes
  alter column empresa set not null,
  alter column celular set not null,
  alter column correo set not null,
  alter column giro set not null,
  alter column medio_contacto set not null,
  alter column contactado_por set not null,
  add constraint clientes_textos_no_vacios check (
    char_length(trim(empresa)) > 0
    and char_length(trim(celular)) > 0
    and char_length(trim(correo)) > 0
    and char_length(trim(giro)) > 0
  );
