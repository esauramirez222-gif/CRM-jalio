/** Lo mínimo que el tablero necesita de un cliente. */
type ClienteTablero = {
  id: string
  empresa: string
  nombre: string
  estado_id: string
  updated_at: string
  monto_cotizacion?: number | string | null
  producto?: string | null
}

/**
 * Agrupa los clientes en columnas, una por estado y en el orden de `idsEstados`
 * (las vacías también existen). Cada columna va del más recientemente actualizado
 * al más antiguo. Clientes con un estado desconocido se ignoran.
 */
export function agruparPorEstado<T extends ClienteTablero>(clientes: T[], idsEstados: string[]): Map<string, T[]> {
  const columnas = new Map<string, T[]>(idsEstados.map((id) => [id, []]))
  for (const c of clientes) columnas.get(c.estado_id)?.push(c)
  for (const lista of columnas.values()) lista.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  return columnas
}

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Filtra por empresa o nombre, sin distinguir mayúsculas ni acentos. */
export function filtrarClientes<T extends ClienteTablero>(clientes: T[], q: string): T[] {
  const termino = normalizar(q.trim())
  if (!termino) return clientes
  return clientes.filter((c) => normalizar(`${c.empresa} ${c.nombre}`).includes(termino))
}

/** Datos de la cotización que se capturan al mover a un estado que los pide. */
export type DatosCotizacion = { monto?: number; producto?: string }

/**
 * Devuelve una copia con el cliente movido a `estadoId` y marcado como actualizado en `ahora`.
 * Si se pasan `monto`/`producto`, también los actualiza; si no, conserva los que tenía.
 */
export function moverCliente<T extends ClienteTablero>(
  clientes: T[],
  id: string,
  estadoId: string,
  ahora: string,
  datos: DatosCotizacion = {},
): T[] {
  return clientes.map((c) =>
    c.id === id
      ? {
          ...c,
          estado_id: estadoId,
          updated_at: ahora,
          ...(datos.monto !== undefined && { monto_cotizacion: datos.monto }),
          ...(datos.producto !== undefined && { producto: datos.producto }),
        }
      : c,
  )
}
