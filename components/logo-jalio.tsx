import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Logo de Jalio: PNG transparente; la "I" es negra en tema claro y blanca en oscuro. */
export function LogoJalio({ tamano = 32, className }: { tamano?: number; className?: string }) {
  return (
    <>
      <Image
        src="/jalio-logo-claro.png"
        alt="Jalio"
        width={tamano}
        height={tamano}
        priority
        className={cn('shrink-0 dark:hidden', className)}
      />
      <Image
        src="/jalio-logo-oscuro.png"
        alt="Jalio"
        width={tamano}
        height={tamano}
        priority
        className={cn('hidden shrink-0 dark:block', className)}
      />
    </>
  )
}
