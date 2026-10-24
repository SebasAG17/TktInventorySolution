import { puedeTransitar } from '../../../dominio/modelo/EstadoTicket'

import type { Ticket } from '../../../dominio/modelo/Ticket'

import type {
  RepositorioTicket,
} from '../../../dominio/puertos/RepositorioTicket'

import {
  TicketNoEncontrado,
  TransicionInvalida,
} from './errores'

/**
 * Caso de uso para aprobar un ticket.
 */
export class AprobarTicket {
  constructor(
    private readonly tickets: RepositorioTicket,
  ) {}

  async ejecutar(id: number): Promise<Ticket> {
    const ticket = await this.tickets.obtenerPorId(id)

    if (!ticket) {
      throw new TicketNoEncontrado(id)  
    }

    if (!puedeTransitar(ticket.estado, 'APROBADO')) {
      throw new TransicionInvalida(ticket.estado, 'APROBADO')
    }

    return this.tickets.actualizarEstado(id, 'APROBADO')
  }
}
