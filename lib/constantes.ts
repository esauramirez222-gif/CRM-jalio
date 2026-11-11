// Listas fijas. Si cambian, actualizar también los CHECK en supabase/migrations.
export const MEDIOS_CONTACTO = ['redes', 'llamada', 'correo'] as const
export type MedioContacto = (typeof MEDIOS_CONTACTO)[number]

/** Texto a mostrar para cada medio. Vive aquí (no en un componente 'use client') para usarse también en el servidor. */
export const ETIQUETA_MEDIO: Record<MedioContacto, string> = {
  redes: 'Redes',
  llamada: 'Llamada',
  correo: 'Correo',
}

export const CONTACTADO_POR = ['Monica', 'Jaziel', 'Leonardo', 'Todos'] as const
export type ContactadoPor = (typeof CONTACTADO_POR)[number]

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
