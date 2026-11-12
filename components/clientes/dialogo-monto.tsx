'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MONTO_INVALIDO } from '@/lib/esquemas'
import { interpretarMonto } from '@/lib/montos'

export type PeticionMonto = { empresa: string; estado: string; montoActual: number | null }

type Props = {
  peticion: PeticionMonto | null
  onConfirmar: (monto: number) => void
  onCancelar: () => void
}

/** Pide el monto de la cotización al mover un cliente a un estado que lo requiere. */
export function DialogoMonto({ peticion, onConfirmar, onCancelar }: Props) {
  return (
    <AlertDialog open={peticion !== null} onOpenChange={(abierto) => !abierto && onCancelar()}>
      <AlertDialogContent>
        {peticion && (
          <FormularioMonto
            key={`${peticion.empresa}-${peticion.estado}`}
            peticion={peticion}
            onConfirmar={onConfirmar}
            onCancelar={onCancelar}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function FormularioMonto({
  peticion,
  onConfirmar,
  onCancelar,
}: {
  peticion: PeticionMonto
  onConfirmar: (monto: number) => void
  onCancelar: () => void
}) {
  const [texto, setTexto] = useState(peticion.montoActual ? String(peticion.montoActual) : '')
  const [error, setError] = useState<string | null>(null)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const monto = interpretarMonto(texto)
    if (monto === null || Number.isNaN(monto)) {
      setError(monto === null ? 'Indica el monto de la cotización' : MONTO_INVALIDO)
      return
    }
    onConfirmar(monto)
  }

  return (
    <form onSubmit={enviar} className="grid gap-4">
      <AlertDialogHeader>
        <AlertDialogTitle>Monto de la cotización</AlertDialogTitle>
        <AlertDialogDescription>
          ¿De cuánto fue la cotización para «{peticion.empresa}»? Se moverá a {peticion.estado}.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-1.5">
        <Label htmlFor="monto-dialogo">Monto (MXN)</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            id="monto-dialogo"
            inputMode="decimal"
            autoComplete="off"
            placeholder="15,000"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              setError(null)
            }}
            aria-invalid={!!error}
            className="pl-7"
            autoFocus
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <AlertDialogFooter>
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">Guardar y mover</Button>
      </AlertDialogFooter>
    </form>
  )
}
