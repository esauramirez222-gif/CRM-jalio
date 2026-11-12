'use client'

import { useDroppable } from '@dnd-kit/core'
import type { ClienteTablero } from '@/lib/consultas'
import { formatearMonto, sumarMontos } from '@/lib/montos'
import { cn } from '@/lib/utils'
import { TarjetaCliente } from './tarjeta-cliente'

type Props = {
  estado: { id: string; nombre: string; color: string; muestra_suma: boolean }
  clientes: ClienteTablero[]
  arrastrando: boolean
  onAbrir: (c: ClienteTablero) => void
}

/** Una columna del tablero: zona donde se sueltan las cards. */
export function ColumnaEstado({ estado, clientes, arrastrando, onAbrir }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: estado.id })

  return (
    <section
      aria-label={`${estado.nombre}: ${clientes.length} clientes`}
      className="flex w-72 shrink-0 flex-col rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03]"
    >
      <header className="flex items-center gap-2 px-3.5 pt-3.5 pb-2.5">
        <span className="size-2.5 rounded-xl" style={{ backgroundColor: estado.color }} aria-hidden />
        <h2 className="truncate text-sm font-semibold">{estado.nombre}</h2>
        {estado.muestra_suma && (
          <span
            className="ml-auto text-sm font-semibold tabular-nums"
            title={`Suma de cotizaciones en ${estado.nombre}`}
          >
            {formatearMonto(sumarMontos(clientes))}
          </span>
        )}
        <span
          className={cn(
            'rounded-lg bg-foreground/[0.06] px-2 py-0.5 text-xs tabular-nums text-muted-foreground',
            !estado.muestra_suma && 'ml-auto',
          )}
        >
          {clientes.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          'mx-1.5 mb-1.5 flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto rounded-xl p-1.5 transition-colors duration-200',
          'max-h-[calc(100dvh-17rem)]',
          isOver && 'bg-accent ring-2 ring-primary/40',
        )}
      >
        {clientes.map((c) => (
          <TarjetaCliente key={c.id} cliente={c} arrastrando={arrastrando} onAbrir={() => onAbrir(c)} />
        ))}
        {clientes.length === 0 && (
          <p
            className={cn(
              'flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground',
              isOver && 'border-primary/50 text-foreground',
            )}
          >
            {arrastrando ? 'Suelta aquí' : 'Sin clientes'}
          </p>
        )}
      </div>
    </section>
  )
}
