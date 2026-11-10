/**
 * Decide a dónde redirige el proxy, o null si deja pasar la petición.
 * Las server actions (header `next-action`) nunca se redirigen aquí: un 307
 * sobre un POST de acción rompe el cliente; requerirSesion() hace el redirect.
 */
export function destinoProxy({
  hayUsuario,
  ruta,
  esAccion,
}: {
  hayUsuario: boolean
  ruta: string
  esAccion: boolean
}): '/login' | '/' | null {
  if (esAccion) return null
  const enLogin = ruta.startsWith('/login')
  if (!hayUsuario && !enLogin) return '/login'
  if (hayUsuario && enLogin) return '/'
  return null
}
