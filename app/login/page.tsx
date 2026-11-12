'use client'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useActionState, useState } from 'react'
import { LogoJalio } from '@/components/logo-jalio'
import { BotonTema } from '@/components/tema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { iniciarSesion } from './actions'

/** Cuenta compartida con la que entra todo el equipo (el campo sigue siendo editable). */
const CORREO_EQUIPO = 'digital.jalio.dev@gmail.com'

export default function LoginPage() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, null)
  const [verContrasena, setVerContrasena] = useState(false)

  return (
    <main className="relative flex flex-1 items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <BotonTema />
      </div>

      <div className="w-full max-w-sm animate-entrada">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <LogoJalio tamano={64} />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Bienvenido a CRM jalio</h1>
            <p className="text-sm text-muted-foreground">Inicia sesión para ver a tus clientes.</p>
          </div>
        </div>

        <form action={accion} className="glass space-y-5 rounded-3xl p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              defaultValue={CORREO_EQUIPO}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={verContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setVerContrasena((v) => !v)}
                aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={verContrasena}
                title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 outline-none hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {verContrasena ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
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
