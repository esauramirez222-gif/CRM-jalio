/**
 * Interpreta lo que el usuario escribe como monto ("$15,000", "4500.50").
 * Devuelve null si está vacío y NaN si no es un monto válido (> 0, máximo 2 decimales).
 */
export function interpretarMonto(texto: string): number | null {
  const limpio = texto.trim().replace(/[$,\s]/g, '')
  if (!limpio) return null
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return NaN
  const n = Number(limpio)
  return n > 0 ? n : NaN
}

const PESOS = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', currencyDisplay: 'narrowSymbol' })
const PESOS_ENTEROS = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
})

/** "$15,000" (o "$4,500.50" si hay centavos). */
export function formatearMonto(n: number): string {
  return Number.isInteger(n) ? PESOS_ENTEROS.format(n) : PESOS.format(n)
}

/** Suma `monto_cotizacion` (Postgres numeric puede llegar como texto); ignora los vacíos. */
export function sumarMontos(clientes: { monto_cotizacion: number | string | null }[]): number {
  const centavos = clientes.reduce((s, c) => s + Math.round(Number(c.monto_cotizacion ?? 0) * 100), 0)
  return centavos / 100
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "2026-11-11" → "11 nov 2026". Se lee como texto para no desfasarse por la zona horaria. */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
  return `${dia} ${MESES[mes - 1]} ${anio}`
}
