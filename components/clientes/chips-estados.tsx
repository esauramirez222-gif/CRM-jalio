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
            href={`/clientes${construirQuery(filtros, { estado: e.id })}`}
            aria-current={activo ? 'page' : undefined}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97]',
              activo
                ? 'border-transparent bg-foreground text-background shadow-sm'
                : 'glass text-foreground/80 shadow-none hover:-translate-y-px hover:text-foreground',
            )}
          >
            {e.color && <span className="size-2 rounded-2xl" style={{ backgroundColor: e.color }} aria-hidden />}
            {e.nombre}
            <span
              className={cn(
                'min-w-5 rounded-2xl px-1.5 text-center text-xs tabular-nums',
                activo ? 'bg-background/20' : 'bg-foreground/[0.06] text-muted-foreground',
              )}
            >
              {e.total}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
