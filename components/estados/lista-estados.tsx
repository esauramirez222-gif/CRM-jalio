'use client'

import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
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

const clientes = (n: number) => `${n} ${n === 1 ? 'cliente' : 'clientes'}`

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
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <section aria-labelledby="titulo-proceso" className="space-y-3">
        <div>
          <h2 id="titulo-proceso" className="font-semibold tracking-tight">
            Proceso de venta
          </h2>
          <p className="text-sm text-muted-foreground">
            El orden de esta lista es el orden del proceso: así aparecen los estados en los chips y en el formulario de
            clientes. Usa las flechas para moverlos.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <ol className="glass divide-y divide-border overflow-hidden rounded-3xl">
          {estados.map((e, i) => (
            <li key={e.id} className="p-4 transition-colors duration-150 hover:bg-foreground/[0.02]">
              {editando === e.id ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Editar «{e.nombre}»</p>
                  <FormEstado
                    inicial={e}
                    textoBoton="Guardar cambios"
                    onGuardar={(fd) => actualizarEstado(e.id, fd)}
                    onListo={() => setEditando(null)}
                    onCancelar={() => setEditando(null)}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-5 text-right text-sm tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="size-3 shrink-0 rounded-2xl ring-4 ring-foreground/[0.04]" style={{ backgroundColor: e.color }} aria-hidden />
                  <div className="min-w-32 flex-1">
                    <p className="font-medium">{e.nombre}</p>
                    <p className="text-xs text-muted-foreground">{clientes(e.total)}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Mover arriba"
                      aria-label={`Mover ${e.nombre} arriba`}
                      disabled={pendiente || i === 0}
                      onClick={() => ejecutar(() => moverEstado(e.id, 'arriba'))}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Mover abajo"
                      aria-label={`Mover ${e.nombre} abajo`}
                      disabled={pendiente || i === estados.length - 1}
                      onClick={() => ejecutar(() => moverEstado(e.id, 'abajo'))}
                    >
                      <ArrowDown />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditando(e.id)}>
                      <Pencil data-icon="inline-start" />
                      Editar
                    </Button>
                    {e.total > 0 ? (
                      <span title={`Mueve sus ${clientes(e.total)} a otro estado para poder eliminarlo`}>
                        <Button variant="outline" size="sm" disabled aria-label={`No se puede eliminar ${e.nombre}: tiene clientes`}>
                          <Trash2 data-icon="inline-start" />
                          Eliminar
                        </Button>
                      </span>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="outline" size="sm" disabled={pendiente} />}>
                          <Trash2 data-icon="inline-start" />
                          Eliminar
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar «{e.nombre}»?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Desaparecerá de los chips y del formulario de clientes. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={() => ejecutar(() => eliminarEstado(e.id))}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          Un estado con clientes no se puede eliminar: primero cámbialos a otro estado desde la pantalla de Clientes.
        </p>
      </section>

      <section aria-labelledby="titulo-nuevo" className="glass space-y-4 rounded-3xl p-5 lg:sticky lg:top-24">
        <div>
          <h2 id="titulo-nuevo" className="font-semibold tracking-tight">
            Nuevo estado
          </h2>
          <p className="text-sm text-muted-foreground">Se agrega al final del proceso; luego puedes moverlo.</p>
        </div>
        <FormEstado key={estados.length} textoBoton="Agregar estado" onGuardar={crearEstado} />
      </section>
    </div>
  )
}
