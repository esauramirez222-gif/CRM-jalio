import { ListaEstados } from '@/components/estados/lista-estados'
import { requerirSesion } from '@/lib/sesion'

export default async function EstadosPage() {
  const { supabase } = await requerirSesion()
  const { data, error } = await supabase
    .from('estados')
    .select('id, nombre, orden, color, clientes(count)')
    .order('orden')

  if (error) return <p className="text-destructive">No se pudieron cargar los estados.</p>

  const estados = (data ?? []).map(({ clientes, ...e }) => ({ ...e, total: clientes[0]?.count ?? 0 }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Estados</h1>
        <p className="text-sm text-muted-foreground">Las etapas por las que pasa un cliente, desde el primer contacto hasta el cierre.</p>
      </div>
      <ListaEstados estados={estados} />
    </div>
  )
}
