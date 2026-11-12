'use client'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useOptimistic, useState, useSyncExternalStore, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { cambiarEstadoCliente } from '@/app/(app)/clientes/actions'
import { FormCliente } from '@/components/clientes/form-cliente'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ClienteTablero } from '@/lib/consultas'
import { agruparPorEstado, filtrarClientes, moverCliente } from '@/lib/tablero'
import { ColumnaEstado } from './columna-estado'
import { ContenidoTarjeta } from './tarjeta-cliente'

type Estado = { id: string; nombre: string; color: string }

export function TableroKanban({ estados, clientes }: { estados: Estado[]; clientes: ClienteTablero[] }) {
  // La card se mueve al instante; si el guardado falla, React la regresa sola a su columna.
  const [clientesVista, moverOptimista] = useOptimistic(
    clientes,
    (actuales, m: { id: string; estadoId: string }) =>
      moverCliente(actuales, m.id, m.estadoId, new Date().toISOString()),
  )
  const [, iniciar] = useTransition()
  const [q, setQ] = useState('')
  const [activo, setActivo] = useState<ClienteTablero | null>(null)
  const [editando, setEditando] = useState<ClienteTablero | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  // true sólo en el navegador (el portal necesita document.body); false durante el render del servidor.
  const enNavegador = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(t)
  }, [aviso])

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), // un clic simple abre la card
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }), // mantener presionado para arrastrar
    useSensor(KeyboardSensor, { keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] } }),
  )

  const columnas = useMemo(
    () => agruparPorEstado(filtrarClientes(clientesVista, q), estados.map((e) => e.id)),
    [clientesVista, q, estados],
  )
  const nombreEstado = (id: unknown) => estados.find((e) => e.id === id)?.nombre ?? 'otra columna'
  const empresaDe = (id: unknown) => clientesVista.find((c) => c.id === id)?.empresa ?? 'Cliente'

  const anuncios: Announcements = {
    onDragStart: ({ active }) => `Moviendo ${empresaDe(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${empresaDe(active.id)} sobre ${nombreEstado(over.id)}.` : ''),
    onDragEnd: ({ active, over }) =>
      over ? `${empresaDe(active.id)} se movió a ${nombreEstado(over.id)}.` : 'Movimiento cancelado.',
    onDragCancel: () => 'Movimiento cancelado.',
  }

  function alEmpezar({ active }: DragStartEvent) {
    setActivo(clientesVista.find((c) => c.id === active.id) ?? null)
  }

  function alSoltar({ active, over }: DragEndEvent) {
    setActivo(null)
    if (!over) return
    const id = String(active.id)
    const estadoId = String(over.id)
    const cliente = clientesVista.find((c) => c.id === id)
    if (!cliente || cliente.estado_id === estadoId) return

    iniciar(async () => {
      moverOptimista({ id, estadoId })
      const r = await cambiarEstadoCliente(id, estadoId)
      if (!r.ok) setAviso(`No se pudo mover «${cliente.empresa}»: ${r.error}`)
    })
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Tablero</h1>
          <p className="text-sm text-muted-foreground">Arrastra una tarjeta para cambiar al cliente de etapa.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              aria-label="Buscar en el tablero por empresa o nombre"
              placeholder="Buscar empresa o nombre…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          {estados.length > 0 && (
            <FormCliente
              estados={estados}
              disparador={
                <Button className="h-10 px-4 shadow-sm">
                  <Plus data-icon="inline-start" />
                  Nuevo cliente
                </Button>
              }
            />
          )}
        </div>
      </header>

      {aviso && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive animate-entrada"
        >
          {aviso}
          <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)} className="rounded-lg p-1 hover:bg-destructive/10">
            <X className="size-4" />
          </button>
        </div>
      )}

      <DndContext
        id="tablero-clientes"
        sensors={sensores}
        onDragStart={alEmpezar}
        onDragEnd={alSoltar}
        onDragCancel={() => setActivo(null)}
        accessibility={{
          announcements: anuncios,
          screenReaderInstructions: {
            draggable:
              'Presiona Espacio para levantar la tarjeta, flechas para moverla entre columnas, Espacio para soltarla o Escape para cancelar.',
          },
        }}
      >
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
          {estados.map((e) => (
            <ColumnaEstado
              key={e.id}
              estado={e}
              clientes={columnas.get(e.id) ?? []}
              arrastrando={activo !== null}
              onAbrir={setEditando}
            />
          ))}
        </div>
        {/* La tarjeta flotante va en <body>: si quedara dentro de un contenedor con transform,
            su posición fixed se calcularía desde ahí y aparecería desplazada del cursor. */}
        {enNavegador &&
          createPortal(
            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              {activo && (
                <div className="w-[17rem] cursor-grabbing">
                  <ContenidoTarjeta cliente={activo} flotando />
                </div>
              )}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>

      {editando && (
        <FormCliente
          key={editando.id}
          estados={estados}
          cliente={editando}
          abierto
          onAbiertoCambia={(v) => !v && setEditando(null)}
        />
      )}
    </div>
  )
}
