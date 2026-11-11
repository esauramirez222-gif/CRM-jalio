'use client'

import { Kanban, Layers, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ENLACES = [
  { href: '/', texto: 'Tablero', Icono: Kanban },
  { href: '/clientes', texto: 'Clientes', Icono: Users },
  { href: '/estados', texto: 'Estados', Icono: Layers },
] as const

/** Navegación en pastillas; la sección activa se resalta. */
export function NavPrincipal() {
  const ruta = usePathname()

  return (
    <nav aria-label="Principal" className="flex items-center gap-1 rounded-xl bg-foreground/[0.04] p-1">
      {ENLACES.map(({ href, texto, Icono }) => {
        const activo = href === '/' ? ruta === '/' : ruta.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? 'page' : undefined}
            aria-label={texto}
            title={texto}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm sm:px-3.5 font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activo
                ? 'bg-background text-foreground shadow-sm dark:bg-white/10'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icono className="size-4" aria-hidden />
            <span className="hidden sm:inline">{texto}</span>
          </Link>
        )
      })}
    </nav>
  )
}
