'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { CONTACTADO_POR, type ContactadoPor } from '@/lib/constantes'
import { construirQuery, type Filtros } from '@/lib/filtros'

export const claseSelect =
  'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20'

export function BarraFiltros({ filtros }: { filtros: Filtros }) {
  const router = useRouter()
  const [q, setQ] = useState(filtros.q)
  const primera = useRef(true)

  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    const t = setTimeout(() => router.replace(`/${construirQuery(filtros, { q: q.trim() })}`), 300)
    return () => clearTimeout(t)
    // Sólo reaccionar al texto escrito, no a cambios de filtros externos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        type="search"
        aria-label="Buscar por nombre o empresa"
        placeholder="Buscar por nombre o empresa…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-xs"
      />
      <select
        aria-label="Contactado por"
        className={claseSelect}
        value={filtros.por ?? ''}
        onChange={(e) =>
          router.replace(`/${construirQuery(filtros, { por: (e.target.value || null) as ContactadoPor | null })}`)
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
