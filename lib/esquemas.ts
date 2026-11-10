import { z } from 'zod'
import { CONTACTADO_POR, MEDIOS_CONTACTO } from './constantes'

const NOMBRE_OBLIGATORIO = 'El nombre es obligatorio'

const nombre = z.string({ error: NOMBRE_OBLIGATORIO }).trim().min(1, NOMBRE_OBLIGATORIO)

/** Texto opcional: recorta espacios; vacío o ausente se guarda como null. */
const textoOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null)

/** Valor de una lista fija; '' o ausente se guarda como null. */
function opcionDeLista<T extends readonly [string, ...string[]]>(valores: T, mensaje: string) {
  return z
    .union([z.literal(''), z.enum(valores, { error: mensaje })], { error: mensaje })
    .optional()
    .transform((v) => (v ? v : null))
}

export const clienteSchema = z.object({
  nombre,
  empresa: textoOpcional,
  celular: textoOpcional,
  correo: textoOpcional.pipe(z.email({ error: 'Correo inválido' }).nullable()),
  giro: textoOpcional,
  estado_id: z.uuid({ error: 'Selecciona un estado' }),
  medio_contacto: opcionDeLista(MEDIOS_CONTACTO, 'Medio de contacto inválido'),
  contactado_por: opcionDeLista(CONTACTADO_POR, 'Valor inválido'),
})
export type ClienteInput = z.output<typeof clienteSchema>

export const estadoSchema = z.object({
  nombre,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
})
export type EstadoInput = z.output<typeof estadoSchema>

/** Convierte FormData en un objeto plano de strings (descarta archivos). */
export function formDataAObjeto(fd: FormData): Record<string, string> {
  const obj: Record<string, string> = {}
  for (const [clave, valor] of fd.entries()) {
    if (typeof valor === 'string') obj[clave] = valor
  }
  return obj
}
