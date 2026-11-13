-- Producto cotizado (uno por cliente). Lista fija: debe coincidir con PRODUCTOS en lib/constantes.ts.
alter table public.clientes
  add column producto text check (
    producto is null or producto in (
      'Landing page',
      'Sitio para tu negocio',
      'Catálogo en línea',
      'Sitio empresarial',
      'Tienda en línea',
      'Paquetes',
      'Chatbot',
      'E-commerce',
      'Digital Marketing'
    )
  );
