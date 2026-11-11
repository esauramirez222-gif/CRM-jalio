import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Logo de Jalio (fondo oscuro), recortado en cuadro redondeado. */
export function LogoJalio({ tamano = 32, className }: { tamano?: number; className?: string }) {
  return (
    <Image
      src="/jalio-logo.jpg"
      alt="Jalio"
      width={tamano}
      height={tamano}
      priority
      className={cn('shrink-0 rounded-lg', className)}
    />
  )
}
