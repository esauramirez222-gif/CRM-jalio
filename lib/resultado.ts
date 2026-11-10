/** Lo que devuelve toda server action: nunca lanza errores crudos a la UI. */
export type Resultado =
  | { ok: true }
  | { ok: false; error: string; camposConError?: Record<string, string> }
