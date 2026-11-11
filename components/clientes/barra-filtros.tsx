'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { CONTACTADO_POR, type ContactadoPor } from '@/lib/constantes'
import { construirQuery, type Filtros } from '@/lib/filtros'

export const claseSelect =
  'h-10 cursor-pointer rounded-xl border border-input bg-white/70 px-3 text-sm shadow-xs outline-none transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-white/5'

export function BarraFiltros({ filtros }: { filtros: Filtros }) {
  const router = useRouter()
  const [q, setQ] = useState(filtros.q)
  const primera = useRef(true)

  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    const t = setTimeout(() => router.replace(`/clientes${construirQuery(filtros, { q: q.trim() })}`), 300)
    return () => clearTimeout(t)
    // Sólo reaccionar al texto escrito, no a cambios de filtros externos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Buscar por empresa o nombre"
          placeholder="Buscar por empresa o nombre…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <select
        aria-label="Contactado por"
        className={claseSelect}
        value={filtros.por ?? ''}
        onChange={(e) =>
          router.replace(`/clientes${construirQuery(filtros, { por: (e.target.value || null) as ContactadoPor | null })}`)
        }
      >
        <option value="">Contactado por: todos</option>
        {CONTACTADO_POR.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  )
}
