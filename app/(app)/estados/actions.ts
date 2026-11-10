'use server'

import { revalidatePath } from 'next/cache'
import { traducirErrorPg } from '@/lib/errores'
import { estadoSchema, formDataAObjeto } from '@/lib/esquemas'
import { calcularIntercambio } from '@/lib/orden'
import type { Resultado } from '@/lib/resultado'
import { requerirSesion } from '@/lib/sesion'

function refrescar(): Resultado {
  revalidatePath('/estados')
  revalidatePath('/')
  return { ok: true }
}

function validar(fd: FormData) {
  const r = estadoSchema.safeParse(formDataAObjeto(fd))
  if (r.success) return { datos: r.data }
  const camposConError: Record<string, string> = {}
  for (const issue of r.error.issues) {
    const campo = String(issue.path[0])
    camposConError[campo] ??= issue.message
  }
  return { error: { ok: false, error: 'Revisa los campos marcados', camposConError } as Resultado }
}

export async function crearEstado(fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error

  const { data: ultimo } = await supabase
    .from('estados')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('estados').insert({ ...v.datos, orden: (ultimo?.orden ?? 0) + 1 })
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function actualizarEstado(id: string, fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error

  const { error } = await supabase.from('estados').update(v.datos).eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function moverEstado(id: string, dir: 'arriba' | 'abajo'): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const { data: estados, error: errLectura } = await supabase.from('estados').select('id, orden')
  if (errLectura || !estados) return { ok: false, error: traducirErrorPg(errLectura) }

  const cambio = calcularIntercambio(estados, id, dir)
  if (!cambio) return { ok: true }

  for (const fila of cambio) {
    const { error } = await supabase.from('estados').update({ orden: fila.orden }).eq('id', fila.id)
    if (error) return { ok: false, error: traducirErrorPg(error) }
  }
  return refrescar()
}

export async function eliminarEstado(id: string): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const { count, error: errConteo } = await supabase
    .from('clientes')
    .select('id', { count: 'exact', head: true })
    .eq('estado_id', id)
  if (errConteo) return { ok: false, error: traducirErrorPg(errConteo) }
  if (count && count > 0) {
    return {
      ok: false,
      error: `Mueve ${count === 1 ? 'el cliente' : `los ${count} clientes`} de este estado antes de eliminarlo`,
    }
  }

  const { error } = await supabase.from('estados').delete().eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}
