import { describe, expect, it } from 'vitest'
import { formatearFecha, formatearMonto, interpretarMonto, sumarMontos } from './montos'

describe('interpretarMonto', () => {
  it('acepta números con o sin signo de pesos, comas y decimales', () => {
    expect(interpretarMonto('15000')).toBe(15000)
    expect(interpretarMonto('$15,000')).toBe(15000)
    expect(interpretarMonto(' 4,500.50 ')).toBe(4500.5)
  })

  it('vacío es null (sin monto)', () => {
    expect(interpretarMonto('')).toBeNull()
    expect(interpretarMonto('   ')).toBeNull()
  })

  it('texto que no es número, cero o negativos son inválidos (NaN)', () => {
    expect(interpretarMonto('abc')).toBeNaN()
    expect(interpretarMonto('0')).toBeNaN()
    expect(interpretarMonto('-50')).toBeNaN()
    expect(interpretarMonto('12.345')).toBeNaN() // más de 2 decimales
  })
})

describe('formatearMonto', () => {
  it('usa signo de pesos y separador de miles, sin decimales si son cero', () => {
    expect(formatearMonto(15000)).toBe('$15,000')
    expect(formatearMonto(4000)).toBe('$4,000')
    expect(formatearMonto(0)).toBe('$0')
  })

  it('muestra centavos sólo cuando los hay', () => {
    expect(formatearMonto(4500.5)).toBe('$4,500.50')
  })
})

describe('sumarMontos', () => {
  it('suma los montos e ignora los vacíos', () => {
    expect(sumarMontos([{ monto_cotizacion: 10000 }, { monto_cotizacion: 5000 }, { monto_cotizacion: null }])).toBe(15000)
    expect(sumarMontos([])).toBe(0)
  })

  it('acepta montos que Supabase devuelve como texto (numeric)', () => {
    expect(sumarMontos([{ monto_cotizacion: '1000.50' as unknown as number }, { monto_cotizacion: 500 }])).toBe(1500.5)
  })
})

describe('formatearFecha', () => {
  it('formatea una fecha YYYY-MM-DD en español sin desfase de zona horaria', () => {
    expect(formatearFecha('2026-11-11')).toBe('11 nov 2026')
    expect(formatearFecha('2026-01-01')).toBe('1 ene 2026')
  })
})
