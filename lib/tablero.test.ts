import { describe, expect, it } from 'vitest'
import { agruparPorEstado, filtrarClientes, moverCliente } from './tablero'

type C = { id: string; empresa: string; nombre: string; estado_id: string; updated_at: string; monto_cotizacion?: number | null; producto?: string | null }

const clientes: C[] = [
  { id: '1', empresa: 'Fotomex', nombre: 'Ricardo Lara', estado_id: 'a', updated_at: '2026-11-10T10:00:00Z' },
  { id: '2', empresa: 'Clínica Ñandú', nombre: 'Ana Pérez', estado_id: 'a', updated_at: '2026-11-11T10:00:00Z' },
  { id: '3', empresa: 'Medi-k Pets', nombre: 'Luis', estado_id: 'b', updated_at: '2026-11-09T10:00:00Z' },
  { id: '4', empresa: 'Huérfano', nombre: 'X', estado_id: 'zz', updated_at: '2026-11-09T10:00:00Z' },
]

describe('agruparPorEstado', () => {
  it('crea una columna por estado, en el orden dado, aunque esté vacía', () => {
    const g = agruparPorEstado(clientes, ['a', 'b', 'c'])
    expect([...g.keys()]).toEqual(['a', 'b', 'c'])
    expect(g.get('c')).toEqual([])
  })

  it('ordena cada columna por el más recientemente actualizado primero', () => {
    const g = agruparPorEstado(clientes, ['a', 'b'])
    expect(g.get('a')!.map((c) => c.id)).toEqual(['2', '1'])
    expect(g.get('b')!.map((c) => c.id)).toEqual(['3'])
  })

  it('ignora clientes cuyo estado no está en la lista', () => {
    const g = agruparPorEstado(clientes, ['a', 'b'])
    const ids = [...g.values()].flat().map((c) => c.id)
    expect(ids).not.toContain('4')
  })
})

describe('filtrarClientes', () => {
  it('sin búsqueda devuelve todos', () => {
    expect(filtrarClientes(clientes, '  ')).toHaveLength(4)
  })

  it('busca en empresa y nombre sin importar mayúsculas ni acentos', () => {
    expect(filtrarClientes(clientes, 'fotomex').map((c) => c.id)).toEqual(['1'])
    expect(filtrarClientes(clientes, 'PEREZ').map((c) => c.id)).toEqual(['2'])
    expect(filtrarClientes(clientes, 'clinica nandu').map((c) => c.id)).toEqual(['2'])
  })
})

describe('moverCliente', () => {
  it('cambia el estado y lo marca como el más reciente', () => {
    const r = moverCliente(clientes, '1', 'b', '2026-11-12T00:00:00Z')
    const movido = r.find((c) => c.id === '1')!
    expect(movido.estado_id).toBe('b')
    expect(movido.updated_at).toBe('2026-11-12T00:00:00Z')
    expect(agruparPorEstado(r, ['a', 'b']).get('b')!.map((c) => c.id)).toEqual(['1', '3'])
  })

  it('si se indican, guarda monto y producto de la cotización; si no, conserva los que tenía', () => {
    const conDatos = moverCliente(clientes, '1', 'b', 'x', { monto: 15000, producto: 'Chatbot' }).find((c) => c.id === '1')!
    expect(conDatos.monto_cotizacion).toBe(15000)
    expect(conDatos.producto).toBe('Chatbot')
    const previo = [{ ...clientes[0], monto_cotizacion: 9000, producto: 'Paquetes' }]
    const movido = moverCliente(previo, '1', 'b', 'x')[0]
    expect(movido.monto_cotizacion).toBe(9000)
    expect(movido.producto).toBe('Paquetes')
  })

  it('no modifica el arreglo original', () => {
    moverCliente(clientes, '1', 'b', '2026-11-12T00:00:00Z')
    expect(clientes[0].estado_id).toBe('a')
  })

  it('con un id inexistente devuelve los mismos datos', () => {
    expect(moverCliente(clientes, 'nope', 'b', 'x')).toEqual(clientes)
  })
})
