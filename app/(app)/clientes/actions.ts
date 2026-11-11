'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { traducirErrorPg } from '@/lib/errores'
import { clienteSchema, formDataAObjeto } from '@/lib/esquemas'
import type { Resultado } from '@/lib/resultado'
import { requerirSesion } from '@/lib/sesion'

function refrescar(): Resultado {
  revalidatePath('/')
  revalidatePath('/clientes')
  revalidatePath('/estados')
  return { ok: true }
}

function validar(fd: FormData) {
  const r = clienteSchema.safeParse(formDataAObjeto(fd))
  if (r.success) return { datos: r.data }
  const camposConError: Record<string, string> = {}
  for (const issue of r.error.issues) {
    camposConError[String(issue.path[0])] ??= issue.message
  }
  return { error: { ok: false, error: 'Revisa los campos marcados', camposConError } as Resultado }
}

export async function crearCliente(fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error
  const { error } = await supabase.from('clientes').insert(v.datos)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function actualizarCliente(id: string, fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error
  const { error } = await supabase.from('clientes').update(v.datos).eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function cambiarEstadoCliente(id: string, estadoId: string): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  if (!z.uuid().safeParse(estadoId).success) return { ok: false, error: 'Estado inválido' }
  const { error } = await supabase.from('clientes').update({ estado_id: estadoId }).eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function eliminarCliente(id: string): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}
