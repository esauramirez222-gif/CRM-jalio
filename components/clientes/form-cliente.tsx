'use client'

import { useState, useTransition } from 'react'
import { actualizarCliente, crearCliente } from '@/app/(app)/clientes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CONTACTADO_POR, MEDIOS_CONTACTO } from '@/lib/constantes'
import type { ClienteFila, EstadoResumen } from '@/lib/consultas'
import type { Resultado } from '@/lib/resultado'
import { claseSelect } from './barra-filtros'

const ETIQUETA_MEDIO: Record<string, string> = { redes: 'Redes', llamada: 'Llamada', correo: 'Correo' }

type Props = {
  estados: EstadoResumen[]
  cliente?: ClienteFila
  disparador: React.ReactElement
}

export function FormCliente({ estados, cliente, disparador }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [pendiente, iniciar] = useTransition()
  const errores = resultado && !resultado.ok ? (resultado.camposConError ?? {}) : {}

  function cambiarAbierto(v: boolean) {
    setAbierto(v)
    if (!v) setResultado(null)
  }

  // onSubmit (no `action`): React 19 resetea el form tras una action y se perderían los datos si hay errores.
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    iniciar(async () => {
      const r = cliente ? await actualizarCliente(cliente.id, fd) : await crearCliente(fd)
      setResultado(r)
      if (r.ok) setAbierto(false)
    })
  }

  return (
    <Sheet open={abierto} onOpenChange={cambiarAbierto}>
      <SheetTrigger render={disparador} />
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{cliente ? 'Editar cliente' : 'Nuevo cliente'}</SheetTitle>
          <SheetDescription>Todos los campos son obligatorios.</SheetDescription>
        </SheetHeader>
        <form onSubmit={enviar} className="space-y-4 px-4 pb-4" noValidate>
          <Campo nombre="nombre" etiqueta="Nombre" error={errores.nombre}>
            <Input id="nombre" name="nombre" defaultValue={cliente?.nombre} aria-invalid={!!errores.nombre} required />
          </Campo>
          <Campo nombre="empresa" etiqueta="Empresa" error={errores.empresa}>
            <Input
              id="empresa"
              name="empresa"
              defaultValue={cliente?.empresa ?? ''}
              aria-invalid={!!errores.empresa}
              required
            />
          </Campo>
          <Campo nombre="celular" etiqueta="Celular" error={errores.celular}>
            <Input
              id="celular"
              name="celular"
              type="tel"
              defaultValue={cliente?.celular ?? ''}
              aria-invalid={!!errores.celular}
              required
            />
          </Campo>
          <Campo nombre="correo" etiqueta="Correo" error={errores.correo}>
            <Input
              id="correo"
              name="correo"
              type="email"
              defaultValue={cliente?.correo ?? ''}
              aria-invalid={!!errores.correo}
              required
            />
          </Campo>
          <Campo nombre="giro" etiqueta="Giro" error={errores.giro}>
            <Input id="giro" name="giro" defaultValue={cliente?.giro ?? ''} aria-invalid={!!errores.giro} required />
          </Campo>
          <Campo nombre="estado_id" etiqueta="Estado" error={errores.estado_id}>
            <select
              id="estado_id"
              name="estado_id"
              className={`${claseSelect} w-full`}
              defaultValue={cliente?.estado_id ?? estados[0]?.id}
            >
              {estados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo nombre="medio_contacto" etiqueta="Medio de contacto" error={errores.medio_contacto}>
            <select
              id="medio_contacto"
              name="medio_contacto"
              className={`${claseSelect} w-full`}
              defaultValue={cliente?.medio_contacto ?? ''}
              aria-invalid={!!errores.medio_contacto}
              required
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {MEDIOS_CONTACTO.map((m) => (
                <option key={m} value={m}>
                  {ETIQUETA_MEDIO[m]}
                </option>
              ))}
            </select>
          </Campo>
          <Campo nombre="contactado_por" etiqueta="Contactado por" error={errores.contactado_por}>
            <select
              id="contactado_por"
              name="contactado_por"
              className={`${claseSelect} w-full`}
              defaultValue={cliente?.contactado_por ?? ''}
              aria-invalid={!!errores.contactado_por}
              required
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {CONTACTADO_POR.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Campo>
          {resultado && !resultado.ok && Object.keys(errores).length === 0 && (
            <p role="alert" className="text-sm text-destructive">
              {resultado.error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pendiente}>
            {pendiente ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export { ETIQUETA_MEDIO }

function Campo({
  nombre,
  etiqueta,
  error,
  children,
}: {
  nombre: string
  etiqueta: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={nombre}>{etiqueta}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
