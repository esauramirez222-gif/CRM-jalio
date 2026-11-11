'use client'

import { Layers, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ENLACES = [
  { href: '/', texto: 'Clientes', Icono: Users },
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
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activo
                ? 'bg-background text-foreground shadow-sm dark:bg-white/10'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icono className="size-4" aria-hidden />
            {texto}
          </Link>
        )
      })}
    </nav>
  )
}
