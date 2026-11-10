import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { escaparBusqueda, rangoPagina, type Filtros } from '@/lib/filtros'
import type { Database } from '@/lib/tipos'

type Cliente = SupabaseClient<Database>

export type EstadoResumen = { id: string; nombre: string; color: string; orden: number; total: number }
export type ClienteFila = Database['public']['Tables']['clientes']['Row'] & {
  estado: { id: string; nombre: string; color: string } | null
}

export async function listarClientes(
  supabase: Cliente,
  f: Filtros,
): Promise<{ filas: ClienteFila[]; total: number }> {
  let consulta = supabase
    .from('clientes')
    .select('*, estado:estados(id, nombre, color)', { count: 'exact' })
    .order('updated_at', { ascending: false })

  if (f.estado) consulta = consulta.eq('estado_id', f.estado)
  if (f.por) consulta = consulta.eq('contactado_por', f.por)
  if (f.q) {
    const p = escaparBusqueda(f.q)
    consulta = consulta.or(`nombre.ilike.${p},empresa.ilike.${p}`)
  }

  const { data, count, error } = await consulta.range(...rangoPagina(f.pagina))
  if (error) throw new Error('No se pudieron cargar los clientes')
  return { filas: (data ?? []) as ClienteFila[], total: count ?? 0 }
}

export async function conteosPorEstado(supabase: Cliente): Promise<EstadoResumen[]> {
  const { data, error } = await supabase
    .from('estados')
    .select('id, nombre, color, orden, clientes(count)')
    .order('orden')
  if (error) throw new Error('No se pudieron cargar los estados')
  return (data ?? []).map(({ clientes, ...e }) => ({ ...e, total: clientes[0]?.count ?? 0 }))
}
