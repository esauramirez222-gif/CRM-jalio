import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/tipos'

/** Refresca la sesión de Supabase y protege las rutas de la app. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesAEscribir, headers) {
          cookiesAEscribir.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesAEscribir.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers).forEach(([clave, valor]) => response.headers.set(clave, valor))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const enLogin = request.nextUrl.pathname.startsWith('/login')

  if (!user && !enLogin) return redirigir(request, '/login', response)
  if (user && enLogin) return redirigir(request, '/', response)

  return response
}

/** Redirige conservando las cookies de sesión que Supabase haya refrescado. */
function redirigir(request: NextRequest, ruta: string, base: NextResponse) {
  const destino = NextResponse.redirect(new URL(ruta, request.url))
  base.cookies.getAll().forEach((c) => destino.cookies.set(c))
  return destino
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
