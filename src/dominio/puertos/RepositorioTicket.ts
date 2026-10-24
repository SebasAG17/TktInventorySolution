import type {
  Ticket,
  TicketCambios,
  TicketNuevo,
} from '../modelo/Ticket'

import type { EstadoTicket } from '../modelo/EstadoTicket'

/**
 * Puerto del dominio para acceder a los tickets.
 */
export interface RepositorioTicket {
  crear(ticket: TicketNuevo): Promise<Ticket>

  obtenerTodos(): Promise<Ticket[]>

  obtenerPorId(id: number): Promise<Ticket | null>

  /**
   * Cambia el estado de un ticket y devuelve cómo quedó.
   * Quien llama ya validó que la transición sea legal.
   */
  actualizarEstado(
    id: number,
    estado: EstadoTicket,
  ): Promise<Ticket>

  /**
   * Aplica cambios parciales a un ticket y devuelve cómo
   * quedó, o null si el ticket no existe.
   */
  actualizar(
    id: number,
    cambios: TicketCambios,
  ): Promise<Ticket | null>
}
