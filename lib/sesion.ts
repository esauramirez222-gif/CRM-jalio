import 'server-only'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/server'

/**
 * Obtiene el cliente de Supabase y el usuario actual.
 * Sin sesión válida redirige a /login. Toda server action empieza aquí.
 */
export async function requerirSesion() {
  const supabase = await crearClienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, userId: user.id }
}
