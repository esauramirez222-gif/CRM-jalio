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
import { PRODUCTOS } from '@/lib/constantes'
import { MONTO_INVALIDO } from '@/lib/esquemas'
import { interpretarMonto } from '@/lib/montos'
import { claseSelect } from './barra-filtros'

export type PeticionMonto = {
  empresa: string
  estado: string
  montoActual: number | null
  productoActual: string | null
}

export type DatosConfirmados = { monto: number; producto: string }

type Props = {
  peticion: PeticionMonto | null
  onConfirmar: (datos: DatosConfirmados) => void
  onCancelar: () => void
}

/** Pide producto y monto de la cotización al mover un cliente a un estado que los requiere. */
export function DialogoMonto({ peticion, onConfirmar, onCancelar }: Props) {
  return (
    <AlertDialog open={peticion !== null} onOpenChange={(abierto) => !abierto && onCancelar()}>
      <AlertDialogContent>
        {peticion && (
          <FormularioCotizacion
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

function FormularioCotizacion({
  peticion,
  onConfirmar,
  onCancelar,
}: {
  peticion: PeticionMonto
  onConfirmar: (datos: DatosConfirmados) => void
  onCancelar: () => void
}) {
  const [producto, setProducto] = useState(peticion.productoActual ?? '')
  const [texto, setTexto] = useState(peticion.montoActual ? String(peticion.montoActual) : '')
  const [errores, setErrores] = useState<{ producto?: string; monto?: string }>({})

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const monto = interpretarMonto(texto)
    const nuevos: typeof errores = {}
    if (!producto) nuevos.producto = 'Selecciona el producto cotizado'
    if (monto === null) nuevos.monto = 'Indica el monto de la cotización'
    else if (Number.isNaN(monto)) nuevos.monto = MONTO_INVALIDO
    setErrores(nuevos)
    if (Object.keys(nuevos).length === 0 && monto) onConfirmar({ monto, producto })
  }

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <AlertDialogHeader>
        <AlertDialogTitle>Datos de la cotización</AlertDialogTitle>
        <AlertDialogDescription>
          ¿Qué se le cotizó a «{peticion.empresa}» y de cuánto fue? Se moverá a {peticion.estado}.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="producto-dialogo">Producto</Label>
        <select
          id="producto-dialogo"
          className={`${claseSelect} w-full`}
          value={producto}
          onChange={(e) => {
            setProducto(e.target.value)
            setErrores((x) => ({ ...x, producto: undefined }))
          }}
          aria-invalid={!!errores.producto}
          autoFocus
        >
          <option value="" disabled>
            Selecciona…
          </option>
          {PRODUCTOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errores.producto && <p className="text-xs text-destructive">{errores.producto}</p>}
      </div>

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
              setErrores((x) => ({ ...x, monto: undefined }))
            }}
            aria-invalid={!!errores.monto}
            className="pl-7"
          />
        </div>
        {errores.monto && <p className="text-xs text-destructive">{errores.monto}</p>}
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
