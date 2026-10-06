/**
 * Estados permitidos para un ticket.
 */
export const ESTADOS_TICKET = [
  'PENDIENTE',
  'APROBADO',
  'CANCELADO',
  'ENTREGADO',
] as const

export type EstadoTicket = (typeof ESTADOS_TICKET)[number]

/**
 * Verifica si un valor corresponde aa un estado válido.
 */
export function esEstadoTicket(
  valor: unknown,
): valor is EstadoTicket {
  return ESTADOS_TICKET.includes(valor as EstadoTicket)
}

/**
 * Ciclo de vida del ticket: a qué estados puede pasar cada
 * estado.
 *
 * Es una tabla de datos y no una cadena de `if`: agregar un
 * estado nuevo es agregar una fila, y `puedeTransitar` no se
 * toca nunca. CANCELADO y ENTREGADO son finales.
 */
export const TRANSICIONES: Record<
  EstadoTicket,
  readonly EstadoTicket[]
> = {
  PENDIENTE: ['APROBADO', 'CANCELADO'],
  APROBADO: ['ENTREGADO', 'CANCELADO'],
  CANCELADO: [],
  ENTREGADO: [],
}

/**
 * Indica si un ticket puede pasar de un estado a otro.
 */
export function puedeTransitar(
  desde: EstadoTicket,
  hasta: EstadoTicket,
): boolean {
  return TRANSICIONES[desde].includes(hasta)
}

/**
 * Estados a los que un ticket puede pasar desde el actual.
 * Útil para que la capa HTTP muestre las acciones posibles.
 */
export function transicionesDesde(
  estado: EstadoTicket,
): readonly EstadoTicket[] {
  return TRANSICIONES[estado]
}