'use client'

import { useState, useTransition } from 'react'
import { eliminarCliente } from '@/app/(app)/clientes/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function EliminarCliente({ id, nombre }: { id: string; nombre: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()

  function eliminar() {
    setError(null)
    iniciar(async () => {
      const r = await eliminarCliente(id)
      if (!r.ok) setError(r.error)
    })
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" size="sm" disabled={pendiente} />}>
          Eliminar
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a «{nombre}»?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminar}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  )
}
