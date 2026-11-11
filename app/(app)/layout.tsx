import Link from 'next/link'
import { LogoJalio } from '@/components/logo-jalio'
import { Button } from '@/components/ui/button'
import { cerrarSesion } from '@/app/login/actions'
import { requerirSesion } from '@/lib/sesion'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, userId } = await requerirSesion()
  const { data: perfil } = await supabase.from('perfiles').select('nombre').eq('id', userId).maybeSingle()

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap">
            <LogoJalio />
            <span className="hidden sm:inline">SC-Jalio</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="hover:underline">
              Clientes
            </Link>
            <Link href="/estados" className="hover:underline">
              Estados
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {perfil && <span className="hidden text-muted-foreground sm:inline">{perfil.nombre}</span>}
            <form action={cerrarSesion}>
              <Button type="submit" variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
