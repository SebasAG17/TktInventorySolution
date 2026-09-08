import type {
  Ticket,
  TicketNuevo,
} from '../modelo/ticket'

/**
 * Puerto del dominio para acceder a los tickets.
 */
export interface RepositorioTicket {
  crear(ticket: TicketNuevo): Promise<Ticket>

  obtenerTodos(): Promise<Ticket[]>

  obtenerPorId(id: number): Promise<Ticket | null>
}