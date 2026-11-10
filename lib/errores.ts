const MENSAJES: Record<string, string> = {
  '23503': 'Este estado tiene clientes; muévelos antes de eliminarlo',
  '23505': 'Ya existe un estado con ese nombre',
}

/** Traduce un error de Postgres/Supabase a un mensaje en español para la UI. */
export function traducirErrorPg(error: { code?: string } | null): string {
  return (error?.code && MENSAJES[error.code]) || 'No se pudo guardar, intenta de nuevo'
}
