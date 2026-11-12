// Listas fijas. Si cambian, actualizar también los CHECK en supabase/migrations.
export const MEDIOS_CONTACTO = ['redes', 'llamada', 'correo'] as const
export type MedioContacto = (typeof MEDIOS_CONTACTO)[number]

/** Texto a mostrar para cada medio. Vive aquí (no en un componente 'use client') para usarse también en el servidor. */
export const ETIQUETA_MEDIO: Record<MedioContacto, string> = {
  redes: 'Redes',
  llamada: 'Llamada',
  correo: 'Correo',
}

export const CONTACTADO_POR = ['Mónica', 'Jaziel', 'Leonardo', 'Todos'] as const
export type ContactadoPor = (typeof CONTACTADO_POR)[number]

/** Color del cuadro con la inicial en las cards del tablero, según quién contactó al cliente. */
export const COLOR_CONTACTADO: Record<ContactadoPor, string> = {
  Mónica: '#FFE7EE',
  Leonardo: '#EDE8D0',
  Jaziel: '#C8EFE8',
  Todos: '#FACD9B',
}

/** Luminancia relativa WCAG de un color hex (#rrggbb). */
function luminancia(hex: string): number {
  const canal = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5)
}

/** Negro o blanco: el que tenga más contraste sobre `fondo`. */
export function colorTextoSobre(fondo: string): '#000000' | '#ffffff' {
  const l = luminancia(fondo)
  const contrasteNegro = (l + 0.05) / 0.05
  const contrasteBlanco = 1.05 / (l + 0.05)
  return contrasteNegro >= contrasteBlanco ? '#000000' : '#ffffff'
}

export const TAM_PAGINA = 50
export const COLOR_DEFAULT = '#64748b'

/** Paleta para los estados (la usa el selector de color de la pantalla Estados). */
export const COLORES_ESTADO = [
  { valor: '#64748b', nombre: 'Gris' },
  { valor: '#0ea5e9', nombre: 'Azul' },
  { valor: '#8b5cf6', nombre: 'Morado' },
  { valor: '#ec4899', nombre: 'Rosa' },
  { valor: '#ef4444', nombre: 'Rojo' },
  { valor: '#f97316', nombre: 'Naranja' },
  { valor: '#f59e0b', nombre: 'Amarillo' },
  { valor: '#22c55e', nombre: 'Verde' },
] as const
