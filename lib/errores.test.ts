import { describe, expect, it } from 'vitest'
import { traducirErrorPg } from './errores'

describe('traducirErrorPg', () => {
  it('traduce violación de llave foránea (estado con clientes)', () => {
    expect(traducirErrorPg({ code: '23503' })).toBe('Este estado tiene clientes; muévelos antes de eliminarlo')
  })

  it('traduce nombre duplicado', () => {
    expect(traducirErrorPg({ code: '23505' })).toBe('Ya existe un estado con ese nombre')
  })

  it('usa un mensaje genérico para el resto', () => {
    expect(traducirErrorPg({ code: 'XX000' })).toBe('No se pudo guardar, intenta de nuevo')
    expect(traducirErrorPg(null)).toBe('No se pudo guardar, intenta de nuevo')
  })
})
