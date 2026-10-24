import type { Ticket } from '../../../dominio/modelo/Ticket'

import type {
  RepositorioTicket,
} from '../../../dominio/puertos/RepositorioTicket'

import { TicketNoEncontrado } from './errores'

/**
 * Caso de uso para consultar un ticket por su id.
 */
export class ConsultarTicketPorId {
  constructor(
    private readonly tickets: RepositorioTicket,
  ) {}

  async ejecutar(id: number): Promise<Ticket> {
    const ticket = await this.tickets.obtenerPorId(id)

    if (!ticket) {
      throw new TicketNoEncontrado(id)
    }

    return ticket
  }
}
