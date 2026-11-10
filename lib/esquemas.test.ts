import { describe, expect, it } from 'vitest'
import { clienteSchema, estadoSchema, formDataAObjeto } from './esquemas'

const UUID = '3f1c2b9a-6a3e-4c1d-9b7e-2f4a5c6d7e8f'

function errorDe(resultado: ReturnType<typeof clienteSchema.safeParse> | ReturnType<typeof estadoSchema.safeParse>, campo: string) {
  if (resultado.success) return undefined
  return resultado.error.issues.find((i) => i.path[0] === campo)?.message
}

describe('clienteSchema', () => {
  it('acepta un cliente mínimo y deja los opcionales en null', () => {
    const r = clienteSchema.safeParse({ nombre: 'Ana', estado_id: UUID })
    expect(r.success).toBe(true)
    expect(r.data).toEqual({
      nombre: 'Ana',
      empresa: null,
      celular: null,
      correo: null,
      giro: null,
      estado_id: UUID,
      medio_contacto: null,
      contactado_por: null,
    })
  })

  it('rechaza nombre vacío o sólo espacios', () => {
    expect(errorDe(clienteSchema.safeParse({ nombre: '', estado_id: UUID }), 'nombre')).toBe('El nombre es obligatorio')
    expect(errorDe(clienteSchema.safeParse({ nombre: '   ', estado_id: UUID }), 'nombre')).toBe('El nombre es obligatorio')
  })

  it('convierte opcionales vacíos o con espacios a null', () => {
    const r = clienteSchema.safeParse({
      nombre: 'Ana',
      estado_id: UUID,
      empresa: '',
      correo: '  ',
      giro: ' ',
      celular: '',
      medio_contacto: '',
      contactado_por: '',
    })
    expect(r.success).toBe(true)
    expect(r.data).toMatchObject({
      empresa: null,
      correo: null,
      giro: null,
      celular: null,
      medio_contacto: null,
      contactado_por: null,
    })
  })

  it('recorta espacios de los textos', () => {
    const r = clienteSchema.safeParse({ nombre: '  Ana  ', correo: ' A@B.MX ', estado_id: UUID })
    expect(r.data?.nombre).toBe('Ana')
    expect(r.data?.correo).toBe('A@B.MX')
  })

  it('rechaza correo inválido', () => {
    expect(errorDe(clienteSchema.safeParse({ nombre: 'Ana', correo: 'ana@', estado_id: UUID }), 'correo')).toBe('Correo inválido')
  })

  it('rechaza estado_id que no es uuid', () => {
    expect(errorDe(clienteSchema.safeParse({ nombre: 'Ana', estado_id: 'xyz' }), 'estado_id')).toBeDefined()
  })

  it('rechaza valores fuera de las listas fijas', () => {
    expect(errorDe(clienteSchema.safeParse({ nombre: 'Ana', estado_id: UUID, medio_contacto: 'fax' }), 'medio_contacto')).toBeDefined()
    expect(errorDe(clienteSchema.safeParse({ nombre: 'Ana', estado_id: UUID, contactado_por: 'Pedro' }), 'contactado_por')).toBeDefined()
  })

  it('acepta valores de las listas fijas', () => {
    const r = clienteSchema.safeParse({ nombre: 'Ana', estado_id: UUID, medio_contacto: 'llamada', contactado_por: 'Todos' })
    expect(r.data).toMatchObject({ medio_contacto: 'llamada', contactado_por: 'Todos' })
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
