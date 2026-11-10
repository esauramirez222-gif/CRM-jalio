'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COLOR_DEFAULT } from '@/lib/constantes'
import type { Resultado } from '@/lib/resultado'

type Props = {
  inicial?: { nombre: string; color: string }
  textoBoton: string
  onGuardar: (fd: FormData) => Promise<Resultado>
  onListo?: () => void
  onCancelar?: () => void
}

export function FormEstado({ inicial, textoBoton, onGuardar, onListo, onCancelar }: Props) {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [pendiente, iniciar] = useTransition()
  const campos = resultado && !resultado.ok ? resultado.camposConError : undefined

  function enviar(fd: FormData) {
    iniciar(async () => {
      const r = await onGuardar(fd)
      setResultado(r)
      if (r.ok) onListo?.()
    })
  }

  return (
    <form action={enviar} className="flex flex-wrap items-start gap-2">
      <div className="min-w-48 flex-1">
        <Input
          name="nombre"
          aria-label="Nombre del estado"
          placeholder="Nombre del estado"
          defaultValue={inicial?.nombre}
          aria-invalid={!!campos?.nombre}
          required
        />
        {campos?.nombre && <p className="mt-1 text-xs text-destructive">{campos.nombre}</p>}
      </div>
      <Input
        name="color"
        type="color"
        aria-label="Color"
        defaultValue={inicial?.color ?? COLOR_DEFAULT}
        className="h-9 w-14 cursor-pointer p-1"
      />
      <Button type="submit" disabled={pendiente}>
        {pendiente ? 'Guardando…' : textoBoton}
      </Button>
      {onCancelar && (
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
      )}
      {resultado && !resultado.ok && !campos && (
        <p role="alert" className="w-full text-sm text-destructive">
          {resultado.error}
        </p>
      )}
    </form>
  )
}
