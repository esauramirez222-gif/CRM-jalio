import Link from 'next/link'
import { construirQuery, type Filtros } from '@/lib/filtros'
import type { EstadoResumen } from '@/lib/consultas'
import { cn } from '@/lib/utils'

export function ChipsEstados({ estados, filtros }: { estados: EstadoResumen[]; filtros: Filtros }) {
  const total = estados.reduce((s, e) => s + e.total, 0)
  const chips = [{ id: null, nombre: 'Todos', color: undefined, total }, ...estados]

  return (
    <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
      {chips.map((e) => {
        const activo = filtros.estado === e.id
        return (
          <Link
            key={e.id ?? 'todos'}
            href={`/${construirQuery(filtros, { estado: e.id })}`}
            aria-current={activo ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors',
              activo ? 'border-foreground bg-foreground text-background' : 'hover:bg-muted',
            )}
          >
            {e.color && <span className="size-2.5 rounded-full" style={{ backgroundColor: e.color }} aria-hidden />}
            {e.nombre}
            <span className={cn('tabular-nums', activo ? 'opacity-80' : 'text-muted-foreground')}>· {e.total}</span>
          </Link>
        )
      })}
    </nav>
  )
}
