import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Logo de Jalio (versión de fondo blanco, para el tema claro). */
export function LogoJalio({ tamano = 32, className }: { tamano?: number; className?: string }) {
  return (
    <Image
      src="/jalio-logo-claro.jpg"
      alt="Jalio"
      width={tamano}
      height={tamano}
      priority
      className={cn('shrink-0', className)}
    />
  )
}
