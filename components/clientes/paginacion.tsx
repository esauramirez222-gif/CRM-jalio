import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { TAM_PAGINA } from '@/lib/constantes'
import { construirQuery, type Filtros } from '@/lib/filtros'
import { cn } from '@/lib/utils'

export function Paginacion({ filtros, total }: { filtros: Filtros; total: number }) {
  const paginas = Math.max(1, Math.ceil(total / TAM_PAGINA))
  if (paginas === 1) return null
  const { pagina } = filtros
  const clase = cn(buttonVariants({ variant: 'outline', size: 'sm' }))

  return (
    <nav aria-label="Paginación" className="flex items-center justify-end gap-3 text-sm">
      {pagina > 1 && (
        <Link className={clase} href={`/clientes${construirQuery(filtros, { pagina: pagina - 1 })}`}>
          Anterior
        </Link>
      )}
      <span className="text-muted-foreground">
        Página {Math.min(pagina, paginas)} de {paginas}
      </span>
      {pagina < paginas && (
        <Link className={clase} href={`/clientes${construirQuery(filtros, { pagina: pagina + 1 })}`}>
          Siguiente
        </Link>
      )}
    </nav>
  )
}
