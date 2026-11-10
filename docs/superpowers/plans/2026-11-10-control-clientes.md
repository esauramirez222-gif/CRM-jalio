# SC-Jalio — Control de clientes · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App web interna (Next.js + Supabase en Netlify) para registrar clientes y moverlos entre estados editables.

**Architecture:** Next.js App Router; lecturas en Server Components con `@supabase/ssr`, escrituras sólo por server actions validadas con zod que devuelven `Resultado`. La BD (tablas, RLS, triggers, seed) vive en `supabase/migrations`. La lógica pura (validación, filtros, orden, errores) está en `lib/` con pruebas Vitest; la UI se verifica con checklist manual.

**Tech Stack:** Next.js (última estable) + TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + Auth), `@supabase/ssr`, zod, Vitest, Netlify, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-10-control-clientes-design.md`

## Global Constraints

- Todos los textos de UI y mensajes de error en español.
- Listas fijas: `medio_contacto` ∈ `redes`, `llamada`, `correo`; `contactado_por` ∈ `Monica`, `Jaziel`, `Leonardo`, `Todos`. Definidas una sola vez en `lib/constantes.ts` y espejadas en los CHECK de SQL.
- Estados seed en orden: `StandBy`(1), `Contacto`(2), `Catálogo/Mensaje`(3), `Cotización`(4), `Cerró`(5). Color por defecto `#64748b`.
- Paginación de clientes: 50 por página, orden `updated_at` desc.
- Sin registro público; sin historial de estados; mismos permisos para todo usuario autenticado.
- Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon o *publishable* key). La service role key nunca entra al repo ni a Netlify.
- Si la versión instalada de Next.js renombra `middleware.ts` a `proxy.ts`, usar el nombre que indique su documentación; el comportamiento es el mismo.

## Review Focus

1. **Campos opcionales vacíos o con espacios** (`correo: "  "`, `empresa: ""`) → se guardan como `null`, no como error ni como cadena vacía. Prueba en Task 2.
2. **Búsqueda con caracteres especiales** (`%`, `_`, `,`, `(`, `)`) → no rompe el filtro `or` de PostgREST ni actúa como comodín. Prueba en Task 4.
3. **Parámetros de URL inválidos** (`?estado=xyz`, `?pagina=-3`, `?pagina=abc`, `?por=Pedro`) → se ignoran y se usa el valor por defecto, sin error 500. Prueba en Task 4.
4. **Reordenar en los extremos** (subir el primero, bajar el último) → no hace nada. Prueba en Task 3.
5. **Sesión expirada al enviar un formulario** → la server action redirige a `/login` en vez de mostrar un error de RLS. Verificación manual en Task 6.

---

### Task 1: Proyecto base, constantes y Vitest

**Files:**
- Create: proyecto Next.js en la raíz (`create-next-app`), `lib/constantes.ts`, `vitest.config.ts`, `lib/constantes.test.ts`, `.env.example`, `.gitignore` (de create-next-app; confirmar que ignora `.env*.local`)

**Interfaces:**
- Produces: `MEDIOS_CONTACTO` (`readonly ['redes','llamada','correo']`), `CONTACTADO_POR` (`readonly ['Monica','Jaziel','Leonardo','Todos']`), `type MedioContacto`, `type ContactadoPor`, `TAM_PAGINA = 50`, `COLOR_DEFAULT = '#64748b'`.

- [ ] **Step 1:** `git init`; `npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*"`; `npx shadcn@latest init`; `npm i @supabase/supabase-js @supabase/ssr zod`; `npm i -D vitest`. Agregar script `"test": "vitest run"`.
- [ ] **Step 2: Prueba que falla** — `lib/constantes.test.ts`:
```ts
expect(MEDIOS_CONTACTO).toEqual(['redes','llamada','correo'])
expect(CONTACTADO_POR).toEqual(['Monica','Jaziel','Leonardo','Todos'])
expect(TAM_PAGINA).toBe(50)
```
- [ ] **Step 3:** `npm test` → FAIL (módulo no existe).
- [ ] **Step 4:** Crear `lib/constantes.ts` con los valores de Interfaces (`as const`, tipos derivados con `(typeof X)[number]`). Crear `.env.example` con las dos variables vacías.
- [ ] **Step 5:** `npm test` → PASS; `npm run build` → compila.
- [ ] **Step 6:** Commit `chore: proyecto base Next.js con constantes y Vitest`.

### Task 2: Esquemas de validación

**Files:**
- Create: `lib/esquemas.ts`, `lib/esquemas.test.ts`

**Interfaces:**
- Consumes: `MEDIOS_CONTACTO`, `CONTACTADO_POR`.
- Produces: `clienteSchema` (zod) con salida `ClienteInput = { nombre: string; empresa: string|null; celular: string|null; correo: string|null; giro: string|null; estado_id: string; medio_contacto: MedioContacto|null; contactado_por: ContactadoPor|null }`; `estadoSchema` con salida `EstadoInput = { nombre: string; color: string }`; `formDataAObjeto(fd: FormData): Record<string, string>`.

- [ ] **Step 1: Pruebas que fallan** — `lib/esquemas.test.ts`:
  - `cliente válido mínimo`: `{nombre:'Ana', estado_id:<uuid>}` → success, opcionales `null`.
  - `nombre vacío o sólo espacios` → error en `nombre` con mensaje `'El nombre es obligatorio'`.
  - `opcionales vacíos a null`: `{..., empresa:'', correo:'  ', medio_contacto:'', contactado_por:''}` → todos `null`.
  - `recorta espacios`: `nombre:'  Ana  '` → `'Ana'`; `correo:' A@B.MX '` → `'A@B.MX'`.
  - `correo inválido`: `'ana@'` → error en `correo`, mensaje `'Correo inválido'`.
  - `estado_id no uuid` → error en `estado_id`.
  - `medio fuera de lista`: `'fax'` → error; `contactado_por:'Pedro'` → error.
  - `estado`: `{nombre:'Nuevo', color:'#AABBCC'}` válido; `color:'rojo'` → error `'Color inválido'`; `nombre:''` → error `'El nombre es obligatorio'`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar en `lib/esquemas.ts`: helper de texto opcional = `z.string().trim()` + transformación `'' → null`; enums con `z.enum(MEDIOS_CONTACTO)` aceptando `''` → `null`; color con regex `/^#[0-9a-fA-F]{6}$/`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: esquemas zod de cliente y estado`.

### Task 3: Utilidades puras — errores, resultado y reordenamiento

**Files:**
- Create: `lib/resultado.ts`, `lib/errores.ts`, `lib/errores.test.ts`, `lib/orden.ts`, `lib/orden.test.ts`

**Interfaces:**
- Produces:
  - `type Resultado = { ok: true } | { ok: false; error: string; camposConError?: Record<string, string> }`
  - `traducirErrorPg(error: { code?: string } | null): string`
  - `calcularIntercambio(estados: { id: string; orden: number }[], id: string, dir: 'arriba' | 'abajo'): [{ id: string; orden: number }, { id: string; orden: number }] | null` — devuelve las dos filas con su **nuevo** `orden`.

- [ ] **Step 1: Pruebas que fallan**
  - `traducirErrorPg({code:'23503'})` → `'Este estado tiene clientes; muévelos antes de eliminarlo'`
  - `traducirErrorPg({code:'23505'})` → `'Ya existe un estado con ese nombre'`
  - `traducirErrorPg({code:'XX000'})` y `traducirErrorPg(null)` → `'No se pudo guardar, intenta de nuevo'`
  - `calcularIntercambio([{a,1},{b,2},{c,3}], 'b', 'arriba')` → `[{id:'b',orden:1},{id:'a',orden:2}]`
  - entrada desordenada `[{c,3},{a,1},{b,2}]`, `'b','abajo'` → `[{id:'b',orden:3},{id:'c',orden:2}]`
  - `'a','arriba'` → `null`; `'c','abajo'` → `null`; id inexistente → `null`
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar los tres archivos (`calcularIntercambio` ordena por `orden` antes de buscar el vecino).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: traducción de errores y cálculo de reordenamiento`.

### Task 4: Filtros de la lista de clientes

**Files:**
- Create: `lib/filtros.ts`, `lib/filtros.test.ts`

**Interfaces:**
- Consumes: `CONTACTADO_POR`, `TAM_PAGINA`.
- Produces:
  - `type Filtros = { estado: string | null; q: string; por: ContactadoPor | null; pagina: number }`
  - `parseFiltros(sp: Record<string, string | string[] | undefined>): Filtros`
  - `escaparBusqueda(q: string): string` — valor seguro para `.or(\`nombre.ilike.%${x}%,empresa.ilike.%${x}%\`)`
  - `rangoPagina(pagina: number): [number, number]` — `[desde, hasta]` inclusivo para `.range()`

- [ ] **Step 1: Pruebas que fallan**
  - `parseFiltros({})` → `{estado:null, q:'', por:null, pagina:1}`
  - `estado` uuid válido se conserva; `estado:'xyz'` → `null`
  - `por:'Jaziel'` se conserva; `por:'Pedro'` → `null`
  - `pagina:'3'` → 3; `'abc'`, `'-3'`, `'0'` → 1
  - `q:'  ana '` → `'ana'`; arreglo `q:['a','b']` → `'a'`
  - `escaparBusqueda('50%_off')` no contiene `%` ni `_` sin escapar; `escaparBusqueda('a,b(c)')` no contiene `,`, `(` ni `)` sueltos (envolver en comillas dobles de PostgREST y escapar `\`, `"`, `%`, `_`)
  - `rangoPagina(1)` → `[0,49]`; `rangoPagina(2)` → `[50,99]`
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar `lib/filtros.ts`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: parseo de filtros y búsqueda segura`.

### Task 5: Base de datos en Supabase

**Files:**
- Create: `supabase/config.toml` (vía `npx supabase init`), `supabase/migrations/0001_esquema.sql`, `supabase/migrations/0002_seed_estados.sql`, `lib/tipos.ts` (generado)

**Interfaces:**
- Produces: tablas `estados`, `clientes`, `perfiles` exactamente como en spec §4; función `public.ping() returns int`; tipo `Database` en `lib/tipos.ts`.

**Requiere al usuario:** crear el proyecto en supabase.com y compartir el *project ref* para `supabase link` (la contraseña de BD la escribe él en la terminal).

- [ ] **Step 1:** Escribir `0001_esquema.sql`: tablas y CHECKs de spec §4 (incluye `char_length(trim(nombre)) > 0` en ambas tablas, FK `ON DELETE RESTRICT`), índice `clientes(estado_id)`, trigger `updated_at`, trigger `auth.users → perfiles` (`security definer`, `set search_path = ''`), RLS en las tres tablas con políticas para `authenticated` (en `perfiles`: `select` todos, `update` sólo `id = auth.uid()`), `public.ping()` (`select 1`, `security definer`) con `grant execute ... to anon` y `revoke` de `public`.
- [ ] **Step 2:** Escribir `0002_seed_estados.sql` con los cinco estados de Global Constraints.
- [ ] **Step 3:** `npx supabase link --project-ref <ref>` y `npx supabase db push`. Esperado: ambas migraciones aplicadas sin error.
- [ ] **Step 4: Verificar en el SQL editor de Supabase:**
  - `select nombre, orden from estados order by orden;` → 5 filas en el orden del seed.
  - `insert into clientes(nombre, estado_id, medio_contacto) values ('x', (select id from estados limit 1), 'fax');` → falla por CHECK.
  - `delete from estados where id = (select estado_id from clientes limit 1)` tras insertar un cliente válido → falla con `23503`; luego borrar el cliente de prueba.
  - `curl -X POST "$URL/rest/v1/rpc/ping" -H "apikey: $ANON"` → `1`; `curl "$URL/rest/v1/clientes" -H "apikey: $ANON"` → `[]` (RLS bloquea anon).
- [ ] **Step 5:** `npx supabase gen types typescript --linked > lib/tipos.ts`; `npm run build` → compila.
- [ ] **Step 6:** Commit `feat: migraciones de BD con RLS, triggers y seed`.

### Task 6: Autenticación y layout

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/sesion.ts`, `middleware.ts`, `app/login/page.tsx`, `app/login/actions.ts`, `app/(app)/layout.tsx`
- Modify: `app/page.tsx` (eliminar el de plantilla; la raíz la sirve `app/(app)/page.tsx` en Task 8 — mientras tanto un placeholder en `app/(app)/page.tsx`)

**Interfaces:**
- Consumes: `Database`.
- Produces:
  - `crearClienteServidor(): Promise<SupabaseClient<Database>>` (cookies de `next/headers`)
  - `crearClienteNavegador(): SupabaseClient<Database>`
  - `requerirSesion(): Promise<{ supabase: SupabaseClient<Database>; userId: string }>` — si no hay usuario, `redirect('/login')`. **Toda** server action de Tasks 7–9 empieza llamándola.
  - `iniciarSesion(prev: Resultado | null, fd: FormData): Promise<Resultado>`, `cerrarSesion(): Promise<void>`

- [ ] **Step 1:** Implementar clientes Supabase y `middleware.ts` siguiendo la guía oficial de `@supabase/ssr` para Next.js (refresco de sesión con `getUser()`); rutas sin usuario → `/login`; `/login` con usuario → `/`. Excluir assets estáticos en el `matcher`.
- [ ] **Step 2:** Login con `useActionState`; credenciales inválidas → `'Correo o contraseña incorrectos'`. Layout con navegación "Clientes" / "Estados", nombre del perfil y botón "Cerrar sesión".
- [ ] **Step 3:** Invitar un usuario de prueba desde el panel de Supabase; en Auth → URL Configuration poner `http://localhost:3000` como Site URL.
- [ ] **Step 4: Verificación manual** (`npm run dev`): `/` sin sesión → `/login`; login incorrecto → mensaje; login correcto → layout; cerrar sesión → `/login`. **Review Focus 5:** con la app abierta, borrar las cookies `sb-*` y enviar cualquier formulario → termina en `/login` (verificar de nuevo en Tasks 7–9).
- [ ] **Step 5:** Commit `feat: login con Supabase Auth y protección de rutas`.

### Task 7: CRUD de estados

**Files:**
- Create: `app/(app)/estados/page.tsx`, `app/(app)/estados/actions.ts`, `components/estados/lista-estados.tsx`, `components/estados/form-estado.tsx`

**Interfaces:**
- Consumes: `requerirSesion`, `estadoSchema`, `formDataAObjeto`, `traducirErrorPg`, `calcularIntercambio`, `Resultado`, `COLOR_DEFAULT`.
- Produces (en `estados/actions.ts`): `crearEstado(fd: FormData): Promise<Resultado>`, `actualizarEstado(id: string, fd: FormData): Promise<Resultado>`, `moverEstado(id: string, dir: 'arriba'|'abajo'): Promise<Resultado>`, `eliminarEstado(id: string): Promise<Resultado>`. Todas hacen `revalidatePath('/estados')` y `revalidatePath('/')` cuando `ok`.

- [ ] **Step 1:** Página: estados ordenados por `orden` con conteo de clientes (`select('*, clientes(count)')`).
- [ ] **Step 2:** Acciones. `crearEstado` asigna `orden = max + 1`. `moverEstado` usa `calcularIntercambio`; si `null`, devuelve `{ok:true}` sin escribir. `eliminarEstado` cuenta clientes primero: si N > 0 → `{ok:false, error:\`Mueve los ${N} clientes de este estado antes de eliminarlo\`}`; si no, borra (y cualquier error pasa por `traducirErrorPg`).
- [ ] **Step 3:** UI: formulario (nombre + `<input type="color">`) para crear y editar; botones ↑↓ deshabilitados en extremos; diálogo de confirmación al eliminar; errores visibles.
- [ ] **Step 4: Verificación manual:** crear, renombrar, cambiar color, reordenar (incluido extremo → nada), nombre duplicado → mensaje, eliminar vacío → OK, eliminar con clientes (después de Task 9) → mensaje con N.
- [ ] **Step 5:** Commit `feat: CRUD de estados con reordenamiento`.

### Task 8: Lista de clientes

**Files:**
- Create: `app/(app)/page.tsx` (reemplaza placeholder), `lib/consultas.ts`, `components/clientes/chips-estados.tsx`, `components/clientes/barra-filtros.tsx`, `components/clientes/tabla-clientes.tsx`, `components/clientes/paginacion.tsx`

**Interfaces:**
- Consumes: `parseFiltros`, `escaparBusqueda`, `rangoPagina`, `TAM_PAGINA`, `crearClienteServidor`.
- Produces (en `lib/consultas.ts`):
  - `type ClienteFila = Database['public']['Tables']['clientes']['Row'] & { estado: { id: string; nombre: string; color: string } }`
  - `listarClientes(f: Filtros): Promise<{ filas: ClienteFila[]; total: number }>`
  - `conteosPorEstado(): Promise<{ id: string; nombre: string; color: string; orden: number; total: number }[]>`

- [ ] **Step 1:** `listarClientes`: filtra por `estado`/`por` si no son `null`; `q` no vacío → `.or()` con `escaparBusqueda`; `order('updated_at', {ascending:false})`; `.range(...rangoPagina(f.pagina))`; `count: 'exact'`.
- [ ] **Step 2:** Página: `parseFiltros(await searchParams)`; chips "Todos" + uno por estado con color y conteo, activo según `estado`; buscador y select "Contactado por" que actualizan la URL (`router.replace`, búsqueda con debounce de 300 ms, y al cambiar filtro vuelve a `pagina=1`); tabla con las columnas de spec §5; paginación anterior/siguiente; estado vacío con botón "Nuevo cliente" (abre el formulario de Task 9; mientras tanto sin acción).
- [ ] **Step 3: Verificación manual** con 3+ clientes de prueba insertados en el SQL editor: chips cuentan bien; filtros combinados; recargar conserva filtros; **Review Focus 2 y 3:** buscar `%`, `_`, `a,b`, `(` no da error ni comodín; `/?estado=xyz&pagina=abc&por=Pedro` muestra todo sin error.
- [ ] **Step 4:** Commit `feat: lista de clientes con chips, filtros y paginación`.

### Task 9: Alta, edición, cambio rápido y baja de clientes

**Files:**
- Create: `app/(app)/clientes/actions.ts`, `components/clientes/form-cliente.tsx`, `components/clientes/selector-estado.tsx`, `components/clientes/eliminar-cliente.tsx`
- Modify: `components/clientes/tabla-clientes.tsx`, `app/(app)/page.tsx` (botón "Nuevo cliente" y acciones por fila)

**Interfaces:**
- Consumes: `requerirSesion`, `clienteSchema`, `formDataAObjeto`, `traducirErrorPg`, `Resultado`, `MEDIOS_CONTACTO`, `CONTACTADO_POR`.
- Produces: `crearCliente(fd: FormData): Promise<Resultado>`, `actualizarCliente(id: string, fd: FormData): Promise<Resultado>`, `cambiarEstadoCliente(id: string, estadoId: string): Promise<Resultado>` (valida `estadoId` como uuid), `eliminarCliente(id: string): Promise<Resultado>`. Todas `revalidatePath('/')` cuando `ok`. Errores de zod → `camposConError` con el primer mensaje por campo.

- [ ] **Step 1:** Acciones según Interfaces.
- [ ] **Step 2:** Formulario en `Sheet` de shadcn (crear y editar): campos de spec §4; `estado_id` por defecto el de menor `orden`; selects con opción vacía "—"; errores junto a cada campo; se cierra y refresca al guardar.
- [ ] **Step 3:** Selector de estado en la fila: guarda al cambiar (con `useTransition`), revierte y muestra el error si falla. Eliminar con `AlertDialog`.
- [ ] **Step 4: Verificación manual:** crear con sólo nombre → OK y opcionales vacíos en BD son `NULL` (revisar en Supabase; **Review Focus 1**); correo inválido → mensaje en el campo; editar; cambio rápido actualiza chips; eliminar con confirmación; completar la verificación pendiente de Task 7 (eliminar estado con clientes); Review Focus 5 en estas acciones.
- [ ] **Step 5:** `npm test` y `npm run build` → PASS.
- [ ] **Step 6:** Commit `feat: alta, edición, cambio de estado y baja de clientes`.

### Task 10: Despliegue y keep-alive

**Files:**
- Create: `netlify.toml`, `.github/workflows/keepalive.yml`, `README.md`

**Interfaces:**
- Consumes: `public.ping()`; secretos de GitHub `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

- [ ] **Step 1:** `netlify.toml` con `command = "npm run build"` (Netlify detecta Next.js y aplica su runtime). `keepalive.yml`: `schedule: cron: '0 12 */3 * *'` + `workflow_dispatch`; un paso `curl -fsS -X POST "$SUPABASE_URL/rest/v1/rpc/ping" -H "apikey: $SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{}'`.
- [ ] **Step 2:** `README.md`: cómo correr local, aplicar migraciones, invitar usuarios, variables de entorno, cómo agregar alguien a `contactado_por` (migración que cambia el CHECK + `lib/constantes.ts`), y el checklist manual de spec §8.
- [ ] **Step 3 (con el usuario):** crear repo en GitHub y hacer push; conectar en Netlify; cargar las dos variables de entorno; agregar secretos en GitHub; en Supabase Auth poner el dominio de Netlify como Site URL y redirect URL.
- [ ] **Step 4: Verificación:** ejecutar `keepalive` con *Run workflow* → verde; recorrer el checklist manual de spec §8 sobre la URL de Netlify.
- [ ] **Step 5:** Commit `chore: despliegue en Netlify y keep-alive de Supabase`.
