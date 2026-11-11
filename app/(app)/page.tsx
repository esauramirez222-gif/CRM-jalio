import { TableroKanban } from '@/components/tablero/tablero-kanban'
import { conteosPorEstado, listarParaTablero } from '@/lib/consultas'
import { requerirSesion } from '@/lib/sesion'

/** Pantalla principal: tablero kanban con una columna por estado. */
export default async function TableroPage() {
  const { supabase } = await requerirSesion()
  const [estados, clientes] = await Promise.all([conteosPorEstado(supabase), listarParaTablero(supabase)])

  return (
    <TableroKanban
      estados={estados.map(({ id, nombre, color }) => ({ id, nombre, color }))}
      clientes={clientes}
    />
  )
}
