'use client'

import { useDraggable } from '@dnd-kit/core'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import {
  COLOR_CONTACTADO,
  colorTextoSobre,
  type ContactadoPor,
  ETIQUETA_MEDIO,
  type MedioContacto,
} from '@/lib/constantes'
import type { ClienteTablero } from '@/lib/consultas'
import { formatearFecha, formatearMonto } from '@/lib/montos'
import { cn } from '@/lib/utils'

const ICONO_MEDIO = { llamada: Phone, correo: Mail, redes: MessageCircle } as const

/** Contenido visual de la card (se reutiliza en la card arrastrable y en la "sombra" que sigue al cursor). */
export function ContenidoTarjeta({ cliente, flotando }: { cliente: ClienteTablero; flotando?: boolean }) {
  const medio = cliente.medio_contacto as MedioContacto
  const Icono = ICONO_MEDIO[medio] ?? MessageCircle
  // Sólo el cuadro de la inicial lleva el color de quien contactó; la letra (negra o blanca) se elige por contraste.
  const colorCuadro = COLOR_CONTACTADO[cliente.contactado_por as ContactadoPor]

  return (
    <div
      className={cn(
        'glass space-y-3 rounded-xl p-3.5 text-left',
        flotando && 'rotate-[1.5deg] shadow-2xl ring-2 ring-primary/40',
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold',
            colorCuadro ? 'ring-1 ring-black/5' : 'bg-accent',
          )}
          style={colorCuadro ? { backgroundColor: colorCuadro, color: colorTextoSobre(colorCuadro) } : undefined}
        >
          {cliente.empresa.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight">{cliente.empresa}</p>
          <p className="truncate text-xs text-muted-foreground">{cliente.nombre}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="shrink-0" title="Fecha de ingreso">
          {formatearFecha(cliente.fecha_ingreso)}
        </span>
        {(cliente.producto || cliente.monto_cotizacion !== null) && (
          <span className="min-w-0 truncate text-right" title="Producto y monto de la cotización">
            {cliente.producto}
            {cliente.producto && cliente.monto_cotizacion !== null && ' · '}
            {cliente.monto_cotizacion !== null && (
              <span className="font-semibold tabular-nums text-foreground">
                {formatearMonto(Number(cliente.monto_cotizacion))}
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate rounded-lg bg-foreground/[0.05] px-2 py-0.5 text-muted-foreground">{cliente.giro}</span>
        <span className="flex shrink-0 items-center gap-1 text-muted-foreground" title={`Contactado por ${cliente.contactado_por} vía ${ETIQUETA_MEDIO[medio]?.toLowerCase() ?? '—'}`}>
          <Icono className="size-3.5" aria-hidden />
          {cliente.contactado_por}
        </span>
      </div>
    </div>
  )
}

/** Card arrastrable. Clic o Enter abre la edición; arrastrar (o Espacio) la mueve de columna. */
export function TarjetaCliente({
  cliente,
  arrastrando,
  onAbrir,
}: {
  cliente: ClienteTablero
  arrastrando: boolean
  onAbrir: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: cliente.id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-roledescription="tarjeta arrastrable"
      aria-label={`${cliente.empresa}, ${cliente.nombre}. Enter para editar, Espacio para mover.`}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !arrastrando) {
          e.preventDefault()
          onAbrir()
          return
        }
        listeners?.onKeyDown?.(e)
      }}
      className={cn(
        'cursor-grab touch-manipulation rounded-xl outline-none transition-[opacity,transform] duration-200 select-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing',
        isDragging && 'opacity-30',
      )}
    >
      <ContenidoTarjeta cliente={cliente} />
    </div>
  )
}
