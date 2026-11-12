# SC-Jalio · Control de clientes

App interna para registrar clientes y moverlos entre estados (StandBy → Contacto → Catálogo/Mensaje → Cotización → Cerró).

**Stack:** Next.js 16 + TypeScript + Tailwind/shadcn · Supabase (Postgres + Auth) · Netlify · Vitest.
Diseño: [`docs/superpowers/specs/2026-11-10-control-clientes-design.md`](docs/superpowers/specs/2026-11-10-control-clientes-design.md)

## Correr en local

```bash
npm install
cp .env.example .env.local   # y llenar las dos variables
npm run dev                  # http://localhost:3000
npm test                     # pruebas unitarias
```

Variables (`.env.local` y Netlify):

| Variable | Dónde se obtiene |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → anon / publishable key |

La **service role key nunca** va en el repo ni en Netlify.

## Base de datos

Las tablas, reglas de seguridad (RLS), triggers y estados iniciales están en `supabase/migrations/`.

```bash
npx supabase link --project-ref <ref-del-proyecto>
npx supabase db push
npx supabase gen types typescript --linked > lib/tipos.ts
```

## Usuarios

No hay registro público. Para dar acceso: Supabase → Authentication → Users → **Invite user**. El nombre que se muestra sale de los metadatos `nombre` del usuario (o de la parte antes de la @ del correo).

## Agregar a alguien a "Contactado por"

La lista es fija. Hay que cambiarla en dos lugares:

1. `lib/constantes.ts` → `CONTACTADO_POR`.
2. Una migración nueva en `supabase/migrations/` que reemplace el CHECK:

```sql
alter table public.clientes drop constraint clientes_contactado_por_check;
alter table public.clientes add constraint clientes_contactado_por_check
  check (contactado_por in ('Mónica', 'Jaziel', 'Leonardo', 'Todos', 'NuevaPersona'));
```

## Despliegue (Netlify)

1. Subir el repo a GitHub y conectarlo en Netlify (detecta Next.js solo; `netlify.toml` ya está).
2. Cargar las dos variables de entorno en Netlify.
3. En Supabase → Authentication → URL Configuration: poner la URL de Netlify como **Site URL** y en **Redirect URLs**.
4. En GitHub → Settings → Secrets → Actions: crear `SUPABASE_URL` y `SUPABASE_ANON_KEY` para el workflow `keepalive-supabase`, que hace un ping cada 3 días para que Supabase no pause el proyecto gratuito.

> ⚠️ **GitHub desactiva los workflows programados tras 60 días sin actividad en el repo.** Si dejan de hacer commits, GitHub manda un correo avisando; entren a *Actions → keepalive-supabase → Enable workflow* (o hagan cualquier commit). Si no, Supabase pausará el proyecto ~1 semana después y habrá que restaurarlo desde su panel (los datos no se pierden).

## Checklist manual antes de cada deploy

- [ ] Login correcto e incorrecto; cerrar sesión.
- [ ] Entrar a `/` sin sesión manda a `/login`.
- [ ] Crear cliente sólo con nombre; editar; cambiar estado desde la fila; eliminar.
- [ ] Correo inválido muestra error en el campo.
- [ ] Chips cuentan bien; filtros por estado, búsqueda y "contactado por"; recargar conserva filtros.
- [ ] Buscar `%`, `_`, `a,b` o `(` no da error.
- [ ] Crear, renombrar, reordenar y eliminar estado.
- [ ] Eliminar un estado con clientes se bloquea con mensaje.
- [ ] Nombre de estado duplicado muestra mensaje.
