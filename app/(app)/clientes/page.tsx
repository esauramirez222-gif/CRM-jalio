import { Plus, SearchX, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarraFiltros } from '@/components/clientes/barra-filtros'
import { ChipsEstados } from '@/components/clientes/chips-estados'
import { FormCliente } from '@/components/clientes/form-cliente'
import { Paginacion } from '@/components/clientes/paginacion'
import { TablaClientes } from '@/components/clientes/tabla-clientes'
import { Button, buttonVariants } from '@/components/ui/button'
import { conteosPorEstado, listarClientes } from '@/lib/consultas'
import { construirQuery, parseFiltros, ultimaPagina } from '@/lib/filtros'
import { requerirSesion } from '@/lib/sesion'

export default async function ClientesPage({ searchParams }: PageProps<'/clientes'>) {
  const filtros = parseFiltros(await searchParams)
  const { supabase } = await requerirSesion()
  const [estados, { filas, total, fueraDeRango }] = await Promise.all([
    conteosPorEstado(supabase),
    listarClientes(supabase, filtros),
  ])
  if (fueraDeRango) redirect(`/clientes${construirQuery(filtros, { pagina: ultimaPagina(total) })}`)

  const hayFiltros = !!(filtros.estado || filtros.q || filtros.por)
  const totalGeneral = estados.reduce((s, e) => s + e.total, 0)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {totalGeneral === 0
              ? 'Aún no hay clientes registrados.'
              : `${totalGeneral} ${totalGeneral === 1 ? 'cliente' : 'clientes'} en tu proceso de venta.`}
          </p>
        </div>
        {estados.length > 0 && (
          <FormCliente
            estados={estados}
            disparador={
              <Button size="lg" className="h-10 rounded-xl px-4 font-semibold shadow-sm">
                <Plus data-icon="inline-start" />
                Nuevo cliente
              </Button>
            }
          />
        )}
      </header>

      <div className="space-y-3">
        <ChipsEstados estados={estados} filtros={filtros} />
        <BarraFiltros key={`${filtros.estado}-${filtros.por}`} filtros={filtros} />
      </div>

      {filas.length > 0 ? (
        <div className="space-y-4">
          <TablaClientes filas={filas} estados={estados} />
          <Paginacion filtros={filtros} total={total} />
        </div>
      ) : (
        <div className="glass flex flex-col items-center rounded-3xl px-6 py-16 text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
            {hayFiltros ? <SearchX className="size-6" aria-hidden /> : <UserPlus className="size-6" aria-hidden />}
          </span>
          <h2 className="text-lg font-semibold tracking-tight">
            {hayFiltros ? 'Sin resultados' : 'Agrega tu primer cliente'}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hayFiltros
              ? 'Ningún cliente coincide con la búsqueda o los filtros elegidos.'
              : 'Registra a tus clientes para darles seguimiento en cada etapa del proceso de venta.'}
          </p>
          <div className="mt-6">
            {hayFiltros ? (
              <Link href="/clientes" className={buttonVariants({ variant: 'outline', className: 'rounded-xl' })}>
                Quitar filtros
              </Link>
            ) : estados.length > 0 ? (
              <FormCliente
                estados={estados}
                disparador={
                  <Button className="rounded-xl font-semibold">
                    <Plus data-icon="inline-start" />
                    Agregar cliente
                  </Button>
                }
              />
            ) : (
              <Link href="/estados" className={buttonVariants({ variant: 'outline', className: 'rounded-xl' })}>
                Primero crea un estado
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
