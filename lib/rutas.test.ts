import { describe, expect, it } from 'vitest'
import { destinoProxy } from './rutas'

describe('destinoProxy', () => {
  it('manda a /login una página sin sesión', () => {
    expect(destinoProxy({ hayUsuario: false, ruta: '/', esAccion: false })).toBe('/login')
  })

  it('deja pasar una server action sin sesión para que requerirSesion redirija', () => {
    expect(destinoProxy({ hayUsuario: false, ruta: '/', esAccion: true })).toBeNull()
  })

  it('manda a / a quien ya tiene sesión y abre /login', () => {
    expect(destinoProxy({ hayUsuario: true, ruta: '/login', esAccion: false })).toBe('/')
  })

  it('no redirige en los demás casos', () => {
    expect(destinoProxy({ hayUsuario: true, ruta: '/estados', esAccion: false })).toBeNull()
    expect(destinoProxy({ hayUsuario: false, ruta: '/login', esAccion: false })).toBeNull()
    expect(destinoProxy({ hayUsuario: false, ruta: '/login', esAccion: true })).toBeNull()
  })
})
