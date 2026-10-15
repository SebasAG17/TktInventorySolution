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
 * Transiciones de estado permitidas para un ticket.
 */
export const TRANSICIONES: Readonly<
  Record<EstadoTicket, readonly EstadoTicket[]>
> = {
  PENDIENTE: ['APROBADO', 'CANCELADO'],
  APROBADO: ['CANCELADO', 'ENTREGADO'],
  CANCELADO: [],
  ENTREGADO: [],
}

/**
 * Verifica si un valor corresponde aa un estado válido.
 */
export function esEstadoTicket(
  valor: unknown,
): valor is EstadoTicket {
  return ESTADOS_TICKET.includes(valor as EstadoTicket)
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
