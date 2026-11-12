'use client'

import { useState, useTransition } from 'react'
import { cambiarEstadoCliente } from '@/app/(app)/clientes/actions'
import type { EstadoResumen } from '@/lib/consultas'
import { formatearMonto } from '@/lib/montos'
import { claseSelect } from './barra-filtros'
import { DialogoMonto } from './dialogo-monto'

type Props = {
  clienteId: string
  nombreCliente: string
  estadoId: string
  monto: number | string | null
  estados: EstadoResumen[]
}

/** Cambio rápido de estado: guarda al elegir y revierte si falla. En estados con monto, lo pide antes. */
export function SelectorEstado({ clienteId, nombreCliente, estadoId, monto, estados }: Props) {
  const [valor, setValor] = useState(estadoId)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()
  const [pidiendo, setPidiendo] = useState<EstadoResumen | null>(null)
  const actual = estados.find((e) => e.id === valor)
  const montoActual = monto === null ? null : Number(monto)

  function cambiar(nuevo: string, nuevoMonto?: number) {
    const anterior = valor
    setValor(nuevo)
    setError(null)
    iniciar(async () => {
      const r = await cambiarEstadoCliente(clienteId, nuevo, nuevoMonto)
      if (!r.ok) {
        setValor(anterior)
        setError(r.error)
      }
    })
  }

  function elegir(nuevo: string) {
    const destino = estados.find((e) => e.id === nuevo)
    if (destino?.pide_monto) setPidiendo(destino)
    else cambiar(nuevo)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-2xl" style={{ backgroundColor: actual?.color }} aria-hidden />
        <select
          aria-label={`Estado de ${nombreCliente}`}
          className={claseSelect}
          value={valor}
          disabled={pendiente}
          onChange={(e) => elegir(e.target.value)}
        >
          {estados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>
      {actual?.muestra_suma && montoActual !== null && (
        <p className="mt-1 pl-4.5 text-xs font-semibold tabular-nums">{formatearMonto(montoActual)}</p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
      <DialogoMonto
        peticion={pidiendo && { empresa: nombreCliente, estado: pidiendo.nombre, montoActual }}
        onConfirmar={(m) => {
          if (pidiendo) cambiar(pidiendo.id, m)
          setPidiendo(null)
        }}
        onCancelar={() => setPidiendo(null)}
      />
    </div>
  )
}
