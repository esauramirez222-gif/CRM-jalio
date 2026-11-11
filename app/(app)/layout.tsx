import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { cerrarSesion } from '@/app/login/actions'
import { LogoJalio } from '@/components/logo-jalio'
import { NavPrincipal } from '@/components/nav-principal'
import { BotonTema } from '@/components/tema'
import { Button } from '@/components/ui/button'
import { requerirSesion } from '@/lib/sesion'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, userId } = await requerirSesion()
  const { data: perfil } = await supabase.from('perfiles').select('nombre').eq('id', userId).maybeSingle()
  const inicial = perfil?.nombre?.charAt(0).toUpperCase()

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg font-semibold tracking-tight whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogoJalio tamano={30} />
            <span className="hidden sm:inline">SC-Jalio</span>
          </Link>

          <NavPrincipal />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {perfil && (
              <span className="hidden items-center gap-2 pr-1 text-sm text-muted-foreground md:flex">
                <span
                  aria-hidden
                  className="flex size-7 items-center justify-center rounded-2xl bg-primary text-xs font-semibold text-primary-foreground"
                >
                  {inicial}
                </span>
                {perfil.nombre}
              </span>
            )}
            <BotonTema />
            <form action={cerrarSesion}>
              <Button type="submit" variant="ghost" size="sm" aria-label="Cerrar sesión" title="Cerrar sesión">
                <LogOut data-icon="inline-start" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 animate-entrada sm:px-6">{children}</main>
    </div>
  )
}
