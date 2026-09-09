import type {
  Ticket,
  TicketNuevo,
} from '../../../dominio/modelo/Ticket'

import type {
  RepositorioTicket,
} from '../../../dominio/puertos/RepositorioTicket'

import { ConexionSqlServer } from './ConexionSqlServer'

/**
 * Adaptador que implementa RepositorioTicket
 * utilizando SQL Server.
 */
export class RepositorioTicketSqlServer
  implements RepositorioTicket
{
  async crear(ticket: TicketNuevo): Promise<Ticket> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('titulo', ticket.titulo)
      .input('descripcion', ticket.descripcion)
      .input('estado', ticket.estado)
      .input('productoId', ticket.productoId)
      .input('cantidad', ticket.cantidad)
      .query(`
        INSERT INTO Ticket
        (
          titulo,
          descripcion,
          estado,
          productoId,
          cantidad
        )
        OUTPUT
          INSERTED.id,
          INSERTED.titulo,
          INSERTED.descripcion,
          INSERTED.estado,
          INSERTED.productoId,
          INSERTED.cantidad,
          INSERTED.fechaCreacion
        VALUES
        (
          @titulo,
          @descripcion,
          @estado,
          @productoId,
          @cantidad
        )
      `)

    return resultado.recordset[0] as Ticket
  }

  async obtenerTodos(): Promise<Ticket[]> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .query(`
        SELECT
          id,
          titulo,
          descripcion,
          estado,
          productoId,
          cantidad,
          fechaCreacion
        FROM Ticket
        ORDER BY id
      `)

    return resultado.recordset as Ticket[]
  }

  async obtenerPorId(id: number): Promise<Ticket | null> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('id', id)
      .query(`
        SELECT
          id,
          titulo,
          descripcion,
          estado,
          productoId,
          cantidad,
          fechaCreacion
        FROM Ticket
        WHERE id = @id
      `)

    return resultado.recordset[0] ?? null
  }
}