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

/** El ticket ya salió de PENDIENTE y no se puede editar. */
export class TicketNoEditable extends Error {
  constructor(readonly estado: EstadoTicket) {
    super(
      `Un ticket en estado ${estado} ya no se puede editar; solo los PENDIENTE`,
    )
  }
}

/** Los datos enviados no cumplen las reglas del ticket. */
export class DatosTicketInvalidos extends Error {}
