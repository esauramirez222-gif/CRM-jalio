'use server'

import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/server'
import type { Resultado } from '@/lib/resultado'

export async function iniciarSesion(_prev: Resultado | null, fd: FormData): Promise<Resultado> {
  const email = String(fd.get('email') ?? '').trim()
  const password = String(fd.get('password') ?? '')
  if (!email || !password) return { ok: false, error: 'Escribe tu correo y contraseña' }

  const supabase = await crearClienteServidor()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: 'Correo o contraseña incorrectos' }

  redirect('/')
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteServidor()
  await supabase.auth.signOut()
  redirect('/login')
}
