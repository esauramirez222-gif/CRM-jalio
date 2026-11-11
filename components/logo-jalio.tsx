import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Logo de Jalio: versión de fondo blanco en tema claro y de fondo #111 en tema oscuro. */
export function LogoJalio({ tamano = 32, className }: { tamano?: number; className?: string }) {
  return (
    <>
      <Image
        src="/jalio-logo-claro.jpg"
        alt="Jalio"
        width={tamano}
        height={tamano}
        priority
        className={cn('shrink-0 dark:hidden', className)}
      />
      <Image
        src="/jalio-logo-oscuro.jpg"
        alt="Jalio"
        width={tamano}
        height={tamano}
        priority
        className={cn('hidden shrink-0 dark:block', className)}
      />
    </>
  )
}
