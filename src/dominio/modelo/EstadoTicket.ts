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