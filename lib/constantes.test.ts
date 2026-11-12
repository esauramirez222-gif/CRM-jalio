import { describe, expect, it } from 'vitest'
import {
  CONTACTADO_POR,
  COLOR_CONTACTADO,
  COLOR_DEFAULT,
  colorTextoSobre,
  ETIQUETA_MEDIO,
  MEDIOS_CONTACTO,
  TAM_PAGINA,
} from './constantes'

describe('constantes', () => {
  it('define los medios de contacto en orden', () => {
    expect(MEDIOS_CONTACTO).toEqual(['redes', 'llamada', 'correo'])
  })

  it('define quién puede haber contactado', () => {
    expect(CONTACTADO_POR).toEqual(['Monica', 'Jaziel', 'Leonardo', 'Todos'])
  })

  it('tiene etiqueta legible para cada medio de contacto', () => {
    expect(ETIQUETA_MEDIO).toEqual({ redes: 'Redes', llamada: 'Llamada', correo: 'Correo' })
    for (const m of MEDIOS_CONTACTO) expect(ETIQUETA_MEDIO[m]).toBeTruthy()
  })

  it('pagina de 50 en 50 y usa el gris por defecto', () => {
    expect(TAM_PAGINA).toBe(50)
    expect(COLOR_DEFAULT).toBe('#64748b')
  })
})

describe('colores de card por persona', () => {
  it('asigna el color de cada persona que contacta', () => {
    expect(COLOR_CONTACTADO).toEqual({
      Monica: '#FFE7EE',
      Leonardo: '#EDE8D0',
      Jaziel: '#C8EFE8',
      Todos: '#FACD9B',
    })
    for (const p of CONTACTADO_POR) expect(COLOR_CONTACTADO[p]).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('elige texto negro sobre colores claros y blanco sobre oscuros', () => {
    expect(colorTextoSobre('#FFE7EE')).toBe('#000000')
    expect(colorTextoSobre('#EDE8D0')).toBe('#000000')
    expect(colorTextoSobre('#27F5B7')).toBe('#000000')
    expect(colorTextoSobre('#8A0707')).toBe('#ffffff')
    expect(colorTextoSobre('#ffffff')).toBe('#000000')
    expect(colorTextoSobre('#000000')).toBe('#ffffff')
  })
})
