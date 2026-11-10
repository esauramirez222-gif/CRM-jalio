'use client'

import { Button } from '@/components/ui/button'

export default function ErrorApp({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <p className="font-medium">Algo salió mal al cargar esta página.</p>
      <p className="mt-1 text-sm text-muted-foreground">Revisa tu conexión e intenta de nuevo.</p>
      <Button variant="outline" className="mt-4" onClick={reset}>
        Reintentar
      </Button>
    </div>
  )
}
