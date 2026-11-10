'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { iniciarSesion } from './actions'

export default function LoginPage() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, null)

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-4">
      <form action={accion} className="w-full max-w-sm space-y-4 rounded-lg border bg-background p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">SC-Jalio</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión para ver a tus clientes.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {estado && !estado.ok && (
          <p role="alert" className="text-sm text-destructive">
            {estado.error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </main>
  )
}
