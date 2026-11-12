# SC-Jalio — Control de clientes por estado · Diseño

Fecha: 2026-11-10 · Estado: aprobado en conversación, pendiente de revisión escrita

## 1. Objetivo

App web interna para que un equipo pequeño registre a sus clientes y sepa en qué estado del proceso comercial va cada uno (StandBy → Contacto → Catálogo/Mensaje → Cotización → Cerró).

**Éxito:** cualquier miembro del equipo puede dar de alta un cliente, cambiarle el estado en un clic y ver de un vistazo cuántos clientes hay en cada estado, sin pagar hosting ni base de datos.

**Fuera de alcance (v1):** historial de cambios de estado, roles/permisos distintos, tablero Kanban, reportes, registro público de usuarios, importación masiva.

## 2. Restricciones

- Hosting y base de datos con plan gratuito que permita uso comercial.
- Stack JavaScript/TypeScript (lo que el equipo mantiene).
- Equipo pequeño (≤10 personas), todos con los mismos permisos.
- Volumen bajo (cientos a pocos miles de clientes).

## 3. Stack

| Capa | Elección |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (Postgres) |
| Autenticación | Supabase Auth (correo + contraseña) vía `@supabase/ssr` |
| Validación | zod |
| Hosting | Netlify (plan gratuito, uso comercial permitido) |
| Repositorio / CI | GitHub (deploy automático a Netlify desde `main`) |
| Pruebas | Vitest |

### Límites del plan gratuito (verificados 2026-11-10; revisar antes de lanzar)

- **Supabase Free:** 500 MB de BD, 2 proyectos activos, 50k MAU. El proyecto se **pausa tras 1 semana sin actividad en la BD**; los datos se conservan y se restaura manualmente desde el panel. Mitigación en §7.
- **Netlify Free:** permite uso comercial; modelo de créditos (~300/mes). Al agotarse, el sitio se pausa, sin cobro. Confirmar en netlify.com/pricing.
- Vercel Hobby descartado: sólo uso no comercial.

## 4. Modelo de datos

### `estados`
| campo | tipo | restricciones |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| nombre | text | NOT NULL, UNIQUE |
| orden | int | NOT NULL |
| color | text | NOT NULL, default `'#64748b'` (hex) |
| created_at | timestamptz | NOT NULL, default `now()` |

Datos iniciales (seed), en este orden: `StandBy` (1), `Contacto` (2), `Catálogo/Mensaje` (3), `Cotización` (4), `Cerró` (5).

### `clientes`
| campo | tipo | restricciones |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| nombre | text | NOT NULL, no vacío — nombre de la PERSONA de contacto |
| empresa | text | NOT NULL, no vacío — nombre del NEGOCIO (se muestra como título en el listado) |
| celular | text | nullable (opcional, cambio 2026-11-11) |
| correo | text | nullable (opcional); si viene, formato de correo válido |
| giro | text | NOT NULL, no vacío |
| estado_id | uuid | NOT NULL, FK → `estados.id` **ON DELETE RESTRICT** |
| medio_contacto | text | NOT NULL, CHECK en (`'redes'`, `'llamada'`, `'correo'`) |
| contactado_por | text | NOT NULL, CHECK en (`'Mónica'`, `'Jaziel'`, `'Leonardo'`, `'Todos'`) |
| created_at | timestamptz | NOT NULL, default `now()` |
| updated_at | timestamptz | NOT NULL, default `now()`, actualizado por trigger |

- `medio_contacto` es un dato del cliente, editable en cualquier estado (no sólo en "Contacto").
- `contactado_por` es una lista fija en código y en el CHECK. Agregar a alguien requiere una migración y actualizar la constante compartida en `lib/constantes.ts`.
- Sin historial: cambiar de estado sólo actualiza `estado_id`.
- Índices: `clientes(estado_id)`, y búsqueda con `ilike` sobre `nombre` y `empresa` (suficiente para el volumen esperado).

### `perfiles`
| campo | tipo | restricciones |
|---|---|---|
| id | uuid | PK, FK → `auth.users.id` ON DELETE CASCADE |
| nombre | text | NOT NULL |

Se crea automáticamente con un trigger al insertar en `auth.users` (nombre tomado de `raw_user_meta_data.nombre`, o del correo si no viene).

### Seguridad (RLS)

RLS habilitado en las tres tablas. Política única por tabla: el rol `authenticated` puede `SELECT/INSERT/UPDATE/DELETE`; `anon` no tiene acceso. En `perfiles`, cada usuario sólo puede actualizar su propia fila.

## 5. Pantallas

Todas las rutas excepto `/login` exigen sesión (middleware de Next.js con `@supabase/ssr`); sin sesión → redirige a `/login`. Todos los textos en español.

### `/login`
Correo y contraseña. Error genérico ante credenciales inválidas. Sin registro público: las cuentas se invitan desde el panel de Supabase (Authentication → Invite user). Botón de cerrar sesión en el encabezado de la app.

### `/` — Clientes
- **Chips por estado** en el orden de `estados.orden`, con color y conteo (`Cotización · 7`) más un chip "Todos". Clic = filtra la tabla.
- **Búsqueda** por nombre o empresa y **filtro** por `contactado_por`. Los filtros viven en la URL (`?estado=…&q=…&por=…`) para que sobrevivan recargas y se puedan compartir.
- **Tabla:** nombre, empresa, celular, correo, giro, estado, medio, contactado por. Orden por `updated_at` descendente. Paginación de 50.
- **Cambio rápido de estado:** selector en la fila; guarda al cambiar y actualiza los conteos.
- Acciones por fila: editar (abre el formulario) y eliminar (diálogo de confirmación).
- Estado vacío: mensaje y botón "Nuevo cliente".

### Formulario de cliente (panel lateral, crear y editar)
Campos de §4. Todos los campos son obligatorios excepto celular y correo (cambios pedidos el 2026-11-11). Estado por defecto el de menor `orden`; `medio_contacto` y `contactado_por` como selects sin valor por defecto ("Selecciona…"). Validación con el mismo esquema zod en cliente y servidor; errores mostrados junto a cada campo.

### `/estados`
Lista ordenada con nombre, color y número de clientes. Crear, renombrar, cambiar color, subir/bajar orden (↑↓ intercambia `orden` con el vecino). Eliminar:
- Si el estado tiene clientes → bloqueado con mensaje "Mueve los N clientes de este estado antes de eliminarlo".
- Si no → diálogo de confirmación y se elimina.
- Nombre duplicado → mensaje "Ya existe un estado con ese nombre".

## 6. Arquitectura

```
app/
  login/page.tsx
  (app)/layout.tsx          # encabezado, navegación, cerrar sesión
  (app)/page.tsx            # clientes
  (app)/estados/page.tsx
  (app)/clientes/actions.ts # server actions de clientes
  (app)/estados/actions.ts  # server actions de estados
components/                 # tabla, chips, formulario, diálogos
lib/
  supabase/server.ts        # cliente de servidor (@supabase/ssr)
  supabase/client.ts        # cliente de navegador (sólo auth)
  esquemas.ts               # esquemas zod de cliente y estado
  constantes.ts             # MEDIOS_CONTACTO, CONTACTADO_POR
  tipos.ts                  # tipos generados de la BD
middleware.ts               # protección de rutas y refresco de sesión
supabase/migrations/        # SQL: tablas, RLS, triggers, seed
.github/workflows/keepalive.yml
```

- **Lecturas** en Server Components contra Supabase.
- **Escrituras** sólo por server actions: validan con zod, ejecutan en Supabase, `revalidatePath`. Devuelven `{ ok: true }` o `{ ok: false, error, camposConError? }`; nunca lanzan errores crudos a la UI.
- Errores de Postgres traducidos a mensajes en español: `23503` (FK restrict) → estado con clientes; `23505` (unique) → nombre duplicado; resto → "No se pudo guardar, intenta de nuevo".
- Tipos TypeScript generados con `supabase gen types`.

## 7. Despliegue y operación

1. Crear proyecto en Supabase; aplicar `supabase/migrations` (CLI `supabase db push` o SQL editor).
2. Invitar a los usuarios del equipo desde el panel de Supabase.
3. Repo en GitHub → conectar a Netlify (runtime de Next.js de Netlify). Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. La service role key **nunca** se configura en Netlify ni se sube al repo.
4. En Supabase Auth, configurar Site URL y redirect URLs con el dominio de Netlify.
5. **Keep-alive:** función SQL `public.ping()` (devuelve `1`, no lee datos de negocio) con permiso `EXECUTE` para `anon`. Una GitHub Action programada cada 3 días la llama vía `POST /rest/v1/rpc/ping` con la anon key (guardada como secreto de GitHub), para evitar la pausa por inactividad sin exponer datos.

## 8. Pruebas

- **Vitest:** esquemas zod (nombre vacío, correo inválido, valores fuera de las listas, campos opcionales vacíos) y traducción de errores de Postgres.
- **Checklist manual antes de cada deploy:** login/logout; ruta protegida sin sesión; crear, editar, cambiar estado rápido y eliminar cliente; filtros y búsqueda; crear, renombrar, reordenar y eliminar estado; bloqueo al eliminar estado con clientes; nombre de estado duplicado.

## 9. Posibles extensiones (no v1)

Tablero Kanban; historial de cambios de estado; `contactado_por` como tabla editable; fecha de próximo seguimiento; exportar a Excel.
