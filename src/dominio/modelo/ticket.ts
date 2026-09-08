import type { EstadoTicket } from './EstadoTicket'

/**
 * Entidad del dominio Ticket.
 */
export interface Ticket {
  id: number
  titulo: string
  descripcion: string
  estado: EstadoTicket
  productoId: number
  cantidad: number
  fechaCreacion: Date
}

/**
 * Ticket que todavía no existe.
 * El id y la fecha son generados por la base de datos.
 */
export type TicketNuevo = Omit<Ticket, 'id' | 'fechaCreacion'>