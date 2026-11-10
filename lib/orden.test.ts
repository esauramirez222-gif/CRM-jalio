import { describe, expect, it } from 'vitest'
import { calcularIntercambio } from './orden'

const estados = [
  { id: 'a', orden: 1 },
  { id: 'b', orden: 2 },
  { id: 'c', orden: 3 },
]

describe('calcularIntercambio', () => {
  it('sube un estado intercambiando orden con el anterior', () => {
    expect(calcularIntercambio(estados, 'b', 'arriba')).toEqual([
      { id: 'b', orden: 1 },
      { id: 'a', orden: 2 },
    ])
  })

  it('baja un estado aunque la lista venga desordenada', () => {
    const desordenados = [estados[2], estados[0], estados[1]]
    expect(calcularIntercambio(desordenados, 'b', 'abajo')).toEqual([
      { id: 'b', orden: 3 },
      { id: 'c', orden: 2 },
    ])
  })

  it('no hace nada en los extremos', () => {
    expect(calcularIntercambio(estados, 'a', 'arriba')).toBeNull()
    expect(calcularIntercambio(estados, 'c', 'abajo')).toBeNull()
  })

  it('no hace nada con un id inexistente', () => {
    expect(calcularIntercambio(estados, 'z', 'arriba')).toBeNull()
  })
})
