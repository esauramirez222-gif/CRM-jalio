// Listas fijas. Si cambian, actualizar también los CHECK en supabase/migrations.
export const MEDIOS_CONTACTO = ['redes', 'llamada', 'correo'] as const
export type MedioContacto = (typeof MEDIOS_CONTACTO)[number]

export const CONTACTADO_POR = ['Monica', 'Jaziel', 'Leonardo', 'Todos'] as const
export type ContactadoPor = (typeof CONTACTADO_POR)[number]

export const TAM_PAGINA = 50
export const COLOR_DEFAULT = '#64748b'
