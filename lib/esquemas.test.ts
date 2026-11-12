import { describe, expect, it } from 'vitest'
import { clienteSchema, estadoSchema, formDataAObjeto } from './esquemas'

const UUID = '3f1c2b9a-6a3e-4c1d-9b7e-2f4a5c6d7e8f'

function errorDe(resultado: ReturnType<typeof clienteSchema.safeParse> | ReturnType<typeof estadoSchema.safeParse>, campo: string) {
  if (resultado.success) return undefined
  return resultado.error.issues.find((i) => i.path[0] === campo)?.message
}

const COMPLETO = {
  nombre: 'Ana',
  empresa: 'Ferretería Sur',
  celular: '5512345678',
  correo: 'ana@ejemplo.mx',
  giro: 'Ferretería',
  estado_id: UUID,
  medio_contacto: 'llamada',
  contactado_por: 'Todos',
}

describe('clienteSchema', () => {
  it('acepta un cliente con todos los campos', () => {
    const r = clienteSchema.safeParse(COMPLETO)
    expect(r.success).toBe(true)
    expect(r.data).toEqual({ ...COMPLETO, monto_cotizacion: null })
  })

  it('rechaza nombre vacío o sólo espacios', () => {
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, nombre: '' }), 'nombre')).toBe('El nombre es obligatorio')
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, nombre: '   ' }), 'nombre')).toBe('El nombre es obligatorio')
  })

  it('celular y correo son opcionales: vacíos, con espacios o ausentes se guardan como null', () => {
    for (const campo of ['celular', 'correo'] as const) {
      expect(clienteSchema.safeParse({ ...COMPLETO, [campo]: '' }).data?.[campo]).toBeNull()
      expect(clienteSchema.safeParse({ ...COMPLETO, [campo]: '   ' }).data?.[campo]).toBeNull()
      const sinCampo: Partial<typeof COMPLETO> = { ...COMPLETO }
      delete sinCampo[campo]
      expect(clienteSchema.safeParse(sinCampo).data?.[campo]).toBeNull()
    }
  })

  it('exige empresa y giro (vacíos, con espacios o ausentes)', () => {
    for (const campo of ['empresa', 'giro'] as const) {
      expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, [campo]: '' }), campo)).toBe('Este campo es obligatorio')
      expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, [campo]: '  ' }), campo)).toBe('Este campo es obligatorio')
      const sinCampo: Partial<typeof COMPLETO> = { ...COMPLETO }
      delete sinCampo[campo]
      expect(errorDe(clienteSchema.safeParse(sinCampo), campo)).toBe('Este campo es obligatorio')
    }
  })

  it('exige elegir medio de contacto y contactado por', () => {
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, medio_contacto: '' }), 'medio_contacto')).toBe('Selecciona una opción')
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, contactado_por: '' }), 'contactado_por')).toBe('Selecciona una opción')
  })

  it('monto de cotización: opcional, acepta formato con $ y comas', () => {
    expect(clienteSchema.safeParse(COMPLETO).data?.monto_cotizacion).toBeNull()
    expect(clienteSchema.safeParse({ ...COMPLETO, monto_cotizacion: '' }).data?.monto_cotizacion).toBeNull()
    expect(clienteSchema.safeParse({ ...COMPLETO, monto_cotizacion: '$15,000' }).data?.monto_cotizacion).toBe(15000)
  })

  it('rechaza montos inválidos', () => {
    for (const malo of ['abc', '0', '-5']) {
      expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, monto_cotizacion: malo }), 'monto_cotizacion')).toBe(
        'Escribe un monto válido, por ejemplo 15000',
      )
    }
  })

  it('recorta espacios de los textos', () => {
    const r = clienteSchema.safeParse({ ...COMPLETO, nombre: '  Ana  ', correo: ' A@B.MX ' })
    expect(r.data?.nombre).toBe('Ana')
    expect(r.data?.correo).toBe('A@B.MX')
  })

  it('rechaza correo inválido', () => {
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, correo: 'ana@' }), 'correo')).toBe('Correo inválido')
  })

  it('rechaza estado_id que no es uuid', () => {
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, estado_id: 'xyz' }), 'estado_id')).toBeDefined()
  })

  it('rechaza valores fuera de las listas fijas', () => {
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, medio_contacto: 'fax' }), 'medio_contacto')).toBe('Selecciona una opción')
    expect(errorDe(clienteSchema.safeParse({ ...COMPLETO, contactado_por: 'Pedro' }), 'contactado_por')).toBe('Selecciona una opción')
  })
})

describe('estadoSchema', () => {
  it('acepta nombre y color hex', () => {
    expect(estadoSchema.safeParse({ nombre: 'Nuevo', color: '#AABBCC' }).data).toEqual({ nombre: 'Nuevo', color: '#AABBCC' })
  })

  it('rechaza color que no es hex de 6 dígitos', () => {
    expect(errorDe(estadoSchema.safeParse({ nombre: 'Nuevo', color: 'rojo' }), 'color')).toBe('Color inválido')
  })

  it('rechaza nombre vacío', () => {
    expect(errorDe(estadoSchema.safeParse({ nombre: ' ', color: '#AABBCC' }), 'nombre')).toBe('El nombre es obligatorio')
  })
})

describe('formDataAObjeto', () => {
  it('convierte FormData en objeto de strings ignorando archivos', () => {
    const fd = new FormData()
    fd.set('nombre', 'Ana')
    fd.set('correo', '')
    fd.set('archivo', new Blob(['x']))
    expect(formDataAObjeto(fd)).toEqual({ nombre: 'Ana', correo: '' })
  })
})
