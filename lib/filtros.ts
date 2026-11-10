import { CONTACTADO_POR, TAM_PAGINA, type ContactadoPor } from './constantes'

export type Filtros = {
  estado: string | null
  q: string
  por: ContactadoPor | null
  pagina: number
}

type Params = Record<string, string | string[] | undefined>

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function primero(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

/** Lee los filtros de la URL; cualquier valor inválido se ignora. */
export function parseFiltros(sp: Params): Filtros {
  const estado = primero(sp.estado)
  const por = primero(sp.por)
  const pagina = primero(sp.pagina)
  return {
    estado: UUID_RE.test(estado) ? estado : null,
    q: primero(sp.q).trim(),
    por: (CONTACTADO_POR as readonly string[]).includes(por) ? (por as ContactadoPor) : null,
    pagina: /^[1-9]\d*$/.test(pagina) ? Number(pagina) : 1,
  }
}

/**
 * Patrón seguro para usar en un filtro `or` de PostgREST:
 * `.or(\`nombre.ilike.${p},empresa.ilike.${p}\`)`.
 * Escapa los comodines de LIKE (% _ \), quita `*` (comodín de PostgREST)
 * y envuelve en comillas para proteger comas y paréntesis.
 */
export function escaparBusqueda(q: string): string {
  const like = q.replace(/\*/g, '').replace(/[\\%_]/g, (c) => `\\${c}`)
  const citado = like.replace(/[\\"]/g, (c) => `\\${c}`)
  return `"%${citado}%"`
}

/**
 * Arma el query string (con `?`, o '' si no hay nada) aplicando `cambios`.
 * Si cambia cualquier filtro distinto de la página, vuelve a la página 1.
 */
export function construirQuery(f: Filtros, cambios: Partial<Filtros>): string {
  const soloPagina = Object.keys(cambios).every((k) => k === 'pagina')
  const n = { ...f, ...cambios, pagina: soloPagina ? (cambios.pagina ?? f.pagina) : 1 }
  const sp = new URLSearchParams()
  if (n.estado) sp.set('estado', n.estado)
  if (n.q) sp.set('q', n.q)
  if (n.por) sp.set('por', n.por)
  if (n.pagina > 1) sp.set('pagina', String(n.pagina))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** Última página válida para `total` clientes (mínimo 1). */
export function ultimaPagina(total: number): number {
  return Math.max(1, Math.ceil(total / TAM_PAGINA))
}

/** Rango inclusivo [desde, hasta] para `.range()` de Supabase. */
export function rangoPagina(pagina: number): [number, number] {
  const desde = (pagina - 1) * TAM_PAGINA
  return [desde, desde + TAM_PAGINA - 1]
}
