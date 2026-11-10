'use client'

import { useState, useTransition } from 'react'
import { actualizarEstado, crearEstado, eliminarEstado, moverEstado } from '@/app/(app)/estados/actions'
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
import type { Resultado } from '@/lib/resultado'
import { FormEstado } from './form-estado'

export type EstadoConTotal = { id: string; nombre: string; orden: number; color: string; total: number }

export function ListaEstados({ estados }: { estados: EstadoConTotal[] }) {
  const [editando, setEditando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()

  function ejecutar(accion: () => Promise<Resultado>) {
    setError(null)
    iniciar(async () => {
      const r = await accion()
      if (!r.ok) setError(r.error)
    })
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">Nuevo estado</h2>
        <FormEstado key={estados.length} textoBoton="Agregar" onGuardar={crearEstado} />
      </section>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <ul className="divide-y rounded-lg border">
        {estados.map((e, i) => (
          <li key={e.id} className="flex flex-wrap items-center gap-3 p-3">
            {editando === e.id ? (
              <div className="flex-1">
                <FormEstado
                  inicial={e}
                  textoBoton="Guardar"
                  onGuardar={(fd) => actualizarEstado(e.id, fd)}
                  onListo={() => setEditando(null)}
                  onCancelar={() => setEditando(null)}
                />
              </div>
            ) : (
              <>
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: e.color }} aria-hidden />
                <span className="font-medium">{e.nombre}</span>
                <span className="text-sm text-muted-foreground">
                  {e.total} {e.total === 1 ? 'cliente' : 'clientes'}
                </span>
                <div className="ml-auto flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Subir ${e.nombre}`}
                    disabled={pendiente || i === 0}
                    onClick={() => ejecutar(() => moverEstado(e.id, 'arriba'))}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Bajar ${e.nombre}`}
                    disabled={pendiente || i === estados.length - 1}
                    onClick={() => ejecutar(() => moverEstado(e.id, 'abajo'))}
                  >
                    ↓
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditando(e.id)}>
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="outline" size="sm" disabled={pendiente} />}>
                      Eliminar
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar «{e.nombre}»?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {e.total > 0
                            ? `Tiene ${e.total} ${e.total === 1 ? 'cliente' : 'clientes'}; muévelos a otro estado primero.`
                            : 'Esta acción no se puede deshacer.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => ejecutar(() => eliminarEstado(e.id))}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
