import { describe, expect, it } from 'vitest'
import { CONTACTADO_POR, COLOR_DEFAULT, ETIQUETA_MEDIO, MEDIOS_CONTACTO, TAM_PAGINA } from './constantes'

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
