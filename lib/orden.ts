type ConOrden = { id: string; orden: number }

/**
 * Calcula el intercambio de `orden` entre un estado y su vecino.
 * Devuelve las dos filas con su nuevo `orden`, o null si no hay vecino.
 */
export function calcularIntercambio(
  estados: ConOrden[],
  id: string,
  dir: 'arriba' | 'abajo',
): [ConOrden, ConOrden] | null {
  const ordenados = [...estados].sort((a, b) => a.orden - b.orden)
  const i = ordenados.findIndex((e) => e.id === id)
  if (i === -1) return null
  const vecino = ordenados[dir === 'arriba' ? i - 1 : i + 1]
  if (!vecino) return null
  const actual = ordenados[i]
  return [
    { id: actual.id, orden: vecino.orden },
    { id: vecino.id, orden: actual.orden },
  ]
}
