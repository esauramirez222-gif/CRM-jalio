'use client'

import { Moon, Sun } from 'lucide-react'
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

/**
 * Botón sol/luna: alterna entre claro y oscuro.
 * Muestra el tema activo (sol = claro, luna = oscuro); sin elección previa sigue al sistema.
 */
export function BotonTema() {
  const { resolvedTheme, setTheme } = useTheme()
  const [montado, setMontado] = useState(false)
  // El tema real sólo se conoce en el navegador; antes de montar no se pinta icono.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), [])

  const oscuro = resolvedTheme === 'dark'
  const etiqueta = oscuro ? 'Tema oscuro. Cambiar a tema claro' : 'Tema claro. Cambiar a tema oscuro'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={montado ? etiqueta : undefined}
      aria-label={montado ? etiqueta : 'Cambiar tema'}
      onClick={() => setTheme(oscuro ? 'light' : 'dark')}
    >
      {montado && (oscuro ? <Moon /> : <Sun />)}
    </Button>
  )
}
