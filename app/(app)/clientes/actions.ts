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

const MONTO_REQUERIDO = 'Indica el monto de la cotización'

type Supa = Awaited<ReturnType<typeof requerirSesion>>['supabase']

/** ¿El estado exige monto de cotización? */
async function estadoPideMonto(supabase: Supa, estadoId: string): Promise<boolean> {
  const { data } = await supabase.from('estados').select('pide_monto').eq('id', estadoId).maybeSingle()
  return data?.pide_monto ?? false
}

function faltaMonto(): Resultado {
  return { ok: false, error: MONTO_REQUERIDO, camposConError: { monto_cotizacion: MONTO_REQUERIDO } }
}

export async function crearCliente(fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error
  if (!v.datos.monto_cotizacion && (await estadoPideMonto(supabase, v.datos.estado_id))) return faltaMonto()
  const { error } = await supabase.from('clientes').insert(v.datos)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function actualizarCliente(id: string, fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error
  // El campo de monto sólo se muestra en estados con monto: si no vino, no se toca el que ya tenía.
  const { monto_cotizacion, ...resto } = v.datos
  const cambios = fd.has('monto_cotizacion') ? { ...resto, monto_cotizacion } : resto
  if (fd.has('monto_cotizacion') && !monto_cotizacion && (await estadoPideMonto(supabase, resto.estado_id))) {
    return faltaMonto()
  }
  const { error } = await supabase.from('clientes').update(cambios).eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

/**
 * Mueve un cliente de estado. Si el estado "pide monto" (Cotización), `monto` es obligatorio
 * y se guarda junto con el cambio; en otros estados el monto que ya tenía se conserva.
 */
export async function cambiarEstadoCliente(id: string, estadoId: string, monto?: number): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  if (!z.uuid().safeParse(estadoId).success) return { ok: false, error: 'Estado inválido' }
  const montoValido = monto !== undefined && Number.isFinite(monto) && monto > 0
  if (monto !== undefined && !montoValido) return faltaMonto()
  if (!montoValido && (await estadoPideMonto(supabase, estadoId))) return faltaMonto()
  const { error } = await supabase
    .from('clientes')
    .update(montoValido ? { estado_id: estadoId, monto_cotizacion: monto } : { estado_id: estadoId })
    .eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function eliminarCliente(id: string): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}
