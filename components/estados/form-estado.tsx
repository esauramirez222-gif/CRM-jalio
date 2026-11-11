'use client'

import { Check } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COLOR_DEFAULT, COLORES_ESTADO } from '@/lib/constantes'
import type { Resultado } from '@/lib/resultado'
import { cn } from '@/lib/utils'

type Props = {
  inicial?: { nombre: string; color: string }
  textoBoton: string
  onGuardar: (fd: FormData) => Promise<Resultado>
  onListo?: () => void
  onCancelar?: () => void
}

export function FormEstado({ inicial, textoBoton, onGuardar, onListo, onCancelar }: Props) {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [color, setColor] = useState(inicial?.color ?? COLOR_DEFAULT)
  const [pendiente, iniciar] = useTransition()
  const campos = resultado && !resultado.ok ? resultado.camposConError : undefined
  const idNombre = inicial ? `nombre-${inicial.nombre}` : 'nombre-nuevo'

  // Si el estado ya tenía un color fuera de la paleta, se conserva como opción.
  const paleta: { valor: string; nombre: string }[] = [...COLORES_ESTADO]
  if (!paleta.some((c) => c.valor.toLowerCase() === color.toLowerCase())) {
    paleta.unshift({ valor: color, nombre: 'Actual' })
  }

  // onSubmit (no `action`): React 19 resetea el form tras una action y se perderían los datos si hay errores.
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    iniciar(async () => {
      const r = await onGuardar(fd)
      setResultado(r)
      if (r.ok) onListo?.()
    })
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={idNombre}>Nombre</Label>
        <Input
          id={idNombre}
          name="nombre"
          placeholder="Ej. Negociación"
          defaultValue={inicial?.nombre}
          aria-invalid={!!campos?.nombre}
          required
        />
        {campos?.nombre && <p className="text-xs text-destructive">{campos.nombre}</p>}
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium">Color</legend>
        <p className="text-xs text-muted-foreground">Se usa en los chips y en la lista de clientes.</p>
        <input type="hidden" name="color" value={color} />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {paleta.map((c) => {
            const elegido = c.valor.toLowerCase() === color.toLowerCase()
            return (
              <button
                key={c.valor}
                type="button"
                title={c.nombre}
                aria-label={c.nombre}
                aria-pressed={elegido}
                onClick={() => setColor(c.valor)}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow',
                  elegido ? 'ring-2 ring-foreground' : 'hover:ring-2 hover:ring-muted-foreground/40',
                )}
                style={{ backgroundColor: c.valor }}
              >
                {elegido && <Check className="size-4 text-white" aria-hidden />}
              </button>
            )
          })}
        </div>
        {campos?.color && <p className="text-xs text-destructive">{campos.color}</p>}
      </fieldset>

      {resultado && !resultado.ok && !campos && (
        <p role="alert" className="text-sm text-destructive">
          {resultado.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="rounded-xl font-semibold" disabled={pendiente}>
          {pendiente ? 'Guardando…' : textoBoton}
        </Button>
        {onCancelar && (
          <Button type="button" variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
