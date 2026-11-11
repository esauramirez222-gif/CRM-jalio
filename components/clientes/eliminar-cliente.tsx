'use client'

import { Loader2, Trash2 } from 'lucide-react'
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
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={pendiente}
              aria-label={`Eliminar a ${nombre}`}
              title="Eliminar"
            />
          }
        >
          {pendiente ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a «{nombre}»?</AlertDialogTitle>
            <AlertDialogDescription>Se borrará el cliente y sus datos. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={eliminar}>
              Eliminar
            </AlertDialogAction>
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
