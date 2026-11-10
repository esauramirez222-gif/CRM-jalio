import { BarraFiltros } from '@/components/clientes/barra-filtros'
import { ChipsEstados } from '@/components/clientes/chips-estados'
import { FormCliente } from '@/components/clientes/form-cliente'
import { Paginacion } from '@/components/clientes/paginacion'
import { TablaClientes } from '@/components/clientes/tabla-clientes'
import { Button } from '@/components/ui/button'
import { conteosPorEstado, listarClientes } from '@/lib/consultas'
import { redirect } from 'next/navigation'
import { construirQuery, parseFiltros, ultimaPagina } from '@/lib/filtros'
import { requerirSesion } from '@/lib/sesion'

export default async function ClientesPage({ searchParams }: PageProps<'/'>) {
  const filtros = parseFiltros(await searchParams)
  const { supabase } = await requerirSesion()
  const [estados, { filas, total, fueraDeRango }] = await Promise.all([
    conteosPorEstado(supabase),
    listarClientes(supabase, filtros),
  ])
  if (fueraDeRango) redirect(`/${construirQuery(filtros, { pagina: ultimaPagina(total) })}`)

  const hayFiltros = !!(filtros.estado || filtros.q || filtros.por)
  const nuevo = <Button>Nuevo cliente</Button>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Clientes</h1>
        {estados.length > 0 && <FormCliente estados={estados} disparador={nuevo} />}
      </div>

      <ChipsEstados estados={estados} filtros={filtros} />
      <BarraFiltros key={`${filtros.estado}-${filtros.por}`} filtros={filtros} />

      {filas.length > 0 ? (
        <>
          <TablaClientes filas={filas} estados={estados} />
          <Paginacion filtros={filtros} total={total} />
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            {hayFiltros ? 'Ningún cliente coincide con los filtros.' : 'Todavía no hay clientes.'}
          </p>
          {!hayFiltros && estados.length > 0 && (
            <div className="mt-4">
              <FormCliente estados={estados} disparador={<Button variant="outline">Agregar el primero</Button>} />
            </div>
          )}
          {estados.length === 0 && <p className="mt-2 text-sm">Primero crea al menos un estado.</p>}
        </div>
      )}
    </div>
  )
}
