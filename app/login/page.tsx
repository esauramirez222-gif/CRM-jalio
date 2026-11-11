'use client'

import { Loader2 } from 'lucide-react'
import { useActionState } from 'react'
import { LogoJalio } from '@/components/logo-jalio'
import { BotonTema } from '@/components/tema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { iniciarSesion } from './actions'

export default function LoginPage() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, null)

  return (
    <main className="relative flex flex-1 items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <BotonTema />
      </div>

      <div className="w-full max-w-sm animate-entrada">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <LogoJalio tamano={64} />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Bienvenido a SC-Jalio</h1>
            <p className="text-sm text-muted-foreground">Inicia sesión para ver a tus clientes.</p>
          </div>
        </div>

        <form action={accion} className="glass space-y-5 rounded-3xl p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {estado && !estado.ok && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {estado.error}
            </p>
          )}
          <Button type="submit" size="lg" className="h-11 w-full rounded-xl text-[15px] font-semibold" disabled={enviando}>
            {enviando && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  )
}
