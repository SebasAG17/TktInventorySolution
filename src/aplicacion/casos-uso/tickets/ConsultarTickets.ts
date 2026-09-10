import type { Ticket } from '../../../dominio/modelo/Ticket'

import type {
  RepositorioTicket,
} from '../../../dominio/puertos/RepositorioTicket'

/**
 * Caso de uso para consultar todos los tickets.
 */
export class ConsultarTickets {
  constructor(
    private readonly tickets: RepositorioTicket,
  ) {}

  async ejecutar(): Promise<Ticket[]> {
    return this.tickets.obtenerTodos()
  }
}
