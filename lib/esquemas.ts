import { z } from 'zod'
import { CONTACTADO_POR, MEDIOS_CONTACTO } from './constantes'
import { interpretarMonto } from './montos'

export const MONTO_INVALIDO = 'Escribe un monto válido, por ejemplo 15000'

const NOMBRE_OBLIGATORIO = 'El nombre es obligatorio'

const nombre = z.string({ error: NOMBRE_OBLIGATORIO }).trim().min(1, NOMBRE_OBLIGATORIO)

const CAMPO_OBLIGATORIO = 'Este campo es obligatorio'
const SELECCIONA = 'Selecciona una opción'

/** Texto obligatorio: recorta espacios; vacío, sólo espacios o ausente es error. */
const textoObligatorio = z.string({ error: CAMPO_OBLIGATORIO }).trim().min(1, CAMPO_OBLIGATORIO)

/** Texto opcional: recorta espacios; vacío, sólo espacios o ausente se guarda como null. */
const textoOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null)

export const clienteSchema = z.object({
  nombre,
  empresa: textoObligatorio,
  celular: textoOpcional,
  correo: textoOpcional.pipe(z.email({ error: 'Correo inválido' }).nullable()),
  giro: textoObligatorio,
  estado_id: z.uuid({ error: 'Selecciona un estado' }),
  medio_contacto: z.enum(MEDIOS_CONTACTO, { error: SELECCIONA }),
  contactado_por: z.enum(CONTACTADO_POR, { error: SELECCIONA }),
  /** Monto de la cotización. Opcional aquí; la acción exige que exista si el estado "pide monto". */
  monto_cotizacion: z
    .string()
    .optional()
    .transform((v, ctx) => {
      const n = interpretarMonto(v ?? '')
      if (Number.isNaN(n)) {
        ctx.addIssue({ code: 'custom', message: MONTO_INVALIDO })
        return z.NEVER
      }
      return n
    }),
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
