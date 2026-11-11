'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { ThemeProvider, useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

/** Tema claro/oscuro con la clase `.dark` en <html>; por defecto sigue al sistema. */
export function ProveedorTema({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}

const SIGUIENTE = { light: 'dark', dark: 'system', system: 'light' } as const
const ETIQUETA = { light: 'Tema claro', dark: 'Tema oscuro', system: 'Tema del sistema' } as const

/** Botón que alterna claro → oscuro → sistema. */
export function BotonTema() {
  const { theme, setTheme } = useTheme()
  const [montado, setMontado] = useState(false)
  // El tema guardado sólo se conoce en el navegador; antes de montar se muestra un icono neutro.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), [])

  const actual = (montado ? theme : 'system') as keyof typeof SIGUIENTE
  const Icono = actual === 'light' ? Sun : actual === 'dark' ? Moon : Monitor
  const siguiente = SIGUIENTE[actual] ?? 'light'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={`${ETIQUETA[actual]} (cambiar a ${ETIQUETA[siguiente].toLowerCase()})`}
      aria-label={`${ETIQUETA[actual]}. Cambiar a ${ETIQUETA[siguiente].toLowerCase()}`}
      onClick={() => setTheme(siguiente)}
    >
      <Icono />
    </Button>
  )
}
