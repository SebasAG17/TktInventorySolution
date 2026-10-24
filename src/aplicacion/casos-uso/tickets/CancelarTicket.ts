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
 * Caso de uso para cancelar un ticket.
 *
 * Un ticket se puede cancelar mientras esté PENDIENTE o
 * APROBADO; una vez ENTREGADO ya no, porque el producto
 * salió del inventario. Esa regla vive en TRANSICIONES.
 */
export class CancelarTicket {
  constructor(
    private readonly tickets: RepositorioTicket,
  ) {}

  async ejecutar(id: number): Promise<Ticket> {
    const ticket = await this.tickets.obtenerPorId(id)

    if (!ticket) {
      throw new TicketNoEncontrado(id)
    }

    if (!puedeTransitar(ticket.estado, 'CANCELADO')) {
      throw new TransicionInvalida(ticket.estado, 'CANCELADO')
    }

    return this.tickets.actualizarEstado(id, 'CANCELADO')
  }
}
