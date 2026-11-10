import { describe, expect, it } from 'vitest'
import { escaparBusqueda, parseFiltros, rangoPagina } from './filtros'

const UUID = '3f1c2b9a-6a3e-4c1d-9b7e-2f4a5c6d7e8f'

describe('parseFiltros', () => {
  it('usa valores por defecto sin parámetros', () => {
    expect(parseFiltros({})).toEqual({ estado: null, q: '', por: null, pagina: 1 })
  })

  it('conserva un estado uuid válido e ignora uno inválido', () => {
    expect(parseFiltros({ estado: UUID }).estado).toBe(UUID)
    expect(parseFiltros({ estado: 'xyz' }).estado).toBeNull()
  })

  it('conserva contactado_por válido e ignora uno fuera de la lista', () => {
    expect(parseFiltros({ por: 'Jaziel' }).por).toBe('Jaziel')
    expect(parseFiltros({ por: 'Pedro' }).por).toBeNull()
  })

  it('acepta páginas enteras positivas y si no usa 1', () => {
    expect(parseFiltros({ pagina: '3' }).pagina).toBe(3)
    for (const malo of ['abc', '-3', '0', '2.5', '']) {
      expect(parseFiltros({ pagina: malo }).pagina).toBe(1)
    }
  })

  it('recorta la búsqueda y toma el primer valor si viene repetido', () => {
    expect(parseFiltros({ q: '  ana ' }).q).toBe('ana')
    expect(parseFiltros({ q: ['a', 'b'] }).q).toBe('a')
  })
})

describe('escaparBusqueda', () => {
  it('envuelve el término en comillas con comodines alrededor', () => {
    expect(escaparBusqueda('ana')).toBe('"%ana%"')
  })

  it('escapa % y _ para que no actúen como comodines', () => {
    // LIKE: 50\%\_off  → PostgREST (escapa \): 50\\%\\_off
    expect(escaparBusqueda('50%_off')).toBe('"%50\\\\%\\\\_off%"')
  })

  it('protege comas y paréntesis dentro de las comillas', () => {
    expect(escaparBusqueda('a,b(c)')).toBe('"%a,b(c)%"')
  })

  it('escapa comillas dobles y quita asteriscos', () => {
    expect(escaparBusqueda('di"go*')).toBe('"%di\\"go%"')
  })
})

describe('rangoPagina', () => {
  it('calcula el rango inclusivo de 50 en 50', () => {
    expect(rangoPagina(1)).toEqual([0, 49])
    expect(rangoPagina(2)).toEqual([50, 99])
  })
})
