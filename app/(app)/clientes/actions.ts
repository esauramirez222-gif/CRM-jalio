'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PRODUCTOS } from '@/lib/constantes'
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
const PRODUCTO_REQUERIDO = 'Selecciona el producto cotizado'

type Supa = Awaited<ReturnType<typeof requerirSesion>>['supabase']

/** ¿El estado exige monto y producto de cotización? */
async function estadoPideMonto(supabase: Supa, estadoId: string): Promise<boolean> {
  const { data } = await supabase.from('estados').select('pide_monto').eq('id', estadoId).maybeSingle()
  return data?.pide_monto ?? false
}

/** Errores por campo si faltan monto o producto (o null si están completos). */
function faltantes(monto: number | null | undefined, producto: string | null | undefined): Resultado | null {
  const camposConError: Record<string, string> = {}
  if (!monto) camposConError.monto_cotizacion = MONTO_REQUERIDO
  if (!producto) camposConError.producto = PRODUCTO_REQUERIDO
  const errores = Object.values(camposConError)
  return errores.length ? { ok: false, error: errores.join('. '), camposConError } : null
}

export async function crearCliente(fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error
  if (await estadoPideMonto(supabase, v.datos.estado_id)) {
    const falta = faltantes(v.datos.monto_cotizacion, v.datos.producto)
    if (falta) return falta
  }
  const { error } = await supabase.from('clientes').insert(v.datos)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

export async function actualizarCliente(id: string, fd: FormData): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  const v = validar(fd)
  if (v.error) return v.error
  // Monto y producto sólo se muestran en estados con cotización: si no vinieron, no se tocan los que ya tenía.
  const { monto_cotizacion, producto, ...resto } = v.datos
  const conCotizacion = fd.has('monto_cotizacion')
  const cambios = conCotizacion ? { ...resto, monto_cotizacion, producto } : resto
  if (conCotizacion && (await estadoPideMonto(supabase, resto.estado_id))) {
    const falta = faltantes(monto_cotizacion, producto)
    if (falta) return falta
  }
  const { error } = await supabase.from('clientes').update(cambios).eq('id', id)
  if (error) return { ok: false, error: traducirErrorPg(error) }
  return refrescar()
}

/**
 * Mueve un cliente de estado. Si el estado "pide monto" (Cotización), monto y producto son
 * obligatorios y se guardan con el cambio; en otros estados se conservan los que ya tenía.
 */
export async function cambiarEstadoCliente(
  id: string,
  estadoId: string,
  datos: { monto?: number; producto?: string } = {},
): Promise<Resultado> {
  const { supabase } = await requerirSesion()
  if (!z.uuid().safeParse(estadoId).success) return { ok: false, error: 'Estado inválido' }
  const montoValido = datos.monto !== undefined && Number.isFinite(datos.monto) && datos.monto > 0
  const productoValido = datos.producto !== undefined && (PRODUCTOS as readonly string[]).includes(datos.producto)
  if (datos.monto !== undefined && !montoValido) return faltantes(null, datos.producto)!
  if (datos.producto !== undefined && !productoValido) return faltantes(datos.monto, null)!
  if (await estadoPideMonto(supabase, estadoId)) {
    const falta = faltantes(montoValido ? datos.monto : null, productoValido ? datos.producto : null)
    if (falta) return falta
  }
  const { error } = await supabase
    .from('clientes')
    .update({
      estado_id: estadoId,
      ...(montoValido && { monto_cotizacion: datos.monto }),
      ...(productoValido && { producto: datos.producto }),
    })
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
