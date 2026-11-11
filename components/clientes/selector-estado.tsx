'use client'

import { useState, useTransition } from 'react'
import { cambiarEstadoCliente } from '@/app/(app)/clientes/actions'
import type { EstadoResumen } from '@/lib/consultas'
import { claseSelect } from './barra-filtros'

type Props = { clienteId: string; nombreCliente: string; estadoId: string; estados: EstadoResumen[] }

/** Cambio rápido de estado: guarda al elegir y revierte si falla. */
export function SelectorEstado({ clienteId, nombreCliente, estadoId, estados }: Props) {
  const [valor, setValor] = useState(estadoId)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()
  const color = estados.find((e) => e.id === valor)?.color

  function cambiar(nuevo: string) {
    const anterior = valor
    setValor(nuevo)
    setError(null)
    iniciar(async () => {
      const r = await cambiarEstadoCliente(clienteId, nuevo)
      if (!r.ok) {
        setValor(anterior)
        setError(r.error)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-2xl" style={{ backgroundColor: color }} aria-hidden />
        <select
          aria-label={`Estado de ${nombreCliente}`}
          className={claseSelect}
          value={valor}
          disabled={pendiente}
          onChange={(e) => cambiar(e.target.value)}
        >
          {estados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
