import type {
  EstadoTicket,
} from '../../../dominio/modelo/EstadoTicket'

/**
 * El ticket pedido no existe.
 */
export class TicketNoEncontrado extends Error {
  constructor(id: number) {
    super(`No existe el ticket ${id}`)
  }
}

/**
 * El ticket está en un estado desde el que no se puede
 * pasar al estado pedido.
 *
 * Lleva los dos estados para que la capa HTTP pueda
 * explicar el rechazo sin volver a consultar el ticket.
 */
export class TransicionInvalida extends Error {
  constructor(
    readonly desde: EstadoTicket,
    readonly hasta: EstadoTicket,
  ) {
    super(
      `Un ticket en estado ${desde} no puede pasar a ${hasta}`,
    )
  }
}
