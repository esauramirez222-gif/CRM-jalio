-- "Mónica" lleva acento: se corrige el valor guardado y la regla de valores permitidos.
alter table public.clientes drop constraint clientes_contactado_por_check;

update public.clientes set contactado_por = 'Mónica' where contactado_por = 'Monica';

alter table public.clientes add constraint clientes_contactado_por_check
  check (contactado_por in ('Mónica', 'Jaziel', 'Leonardo', 'Todos'));
