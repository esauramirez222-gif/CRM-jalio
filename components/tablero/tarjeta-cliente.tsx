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
import { cn } from '@/lib/utils'

const ICONO_MEDIO = { llamada: Phone, correo: Mail, redes: MessageCircle } as const

/** Contenido visual de la card (se reutiliza en la card arrastrable y en la "sombra" que sigue al cursor). */
export function ContenidoTarjeta({ cliente, flotando }: { cliente: ClienteTablero; flotando?: boolean }) {
  const medio = cliente.medio_contacto as MedioContacto
  const Icono = ICONO_MEDIO[medio] ?? MessageCircle
  // Color de la card según quién contactó; el texto (negro o blanco) se elige por contraste.
  const fondo = COLOR_CONTACTADO[cliente.contactado_por as ContactadoPor]
  const texto = fondo ? colorTextoSobre(fondo) : undefined

  return (
    <div
      style={fondo ? { backgroundColor: fondo, color: texto } : undefined}
      className={cn(
        'space-y-3 rounded-xl p-3.5 text-left shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        !fondo && 'glass',
        flotando && 'rotate-[1.5deg] shadow-2xl ring-2 ring-primary/50',
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-current/10 text-xs font-semibold"
        >
          <span className={fondo ? undefined : 'text-foreground'} style={fondo ? { color: texto } : undefined}>
            {cliente.empresa.charAt(0).toUpperCase()}
          </span>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight">{cliente.empresa}</p>
          <p className="truncate text-xs opacity-75">{cliente.nombre}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate rounded-lg bg-current/10 px-2 py-0.5">
          <span className="opacity-80" style={fondo ? { color: texto } : undefined}>
            {cliente.giro}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 opacity-80" title={`Contactado por ${cliente.contactado_por} vía ${ETIQUETA_MEDIO[medio]?.toLowerCase() ?? '—'}`}>
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
