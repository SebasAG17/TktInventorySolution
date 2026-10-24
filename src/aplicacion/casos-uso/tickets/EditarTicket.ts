import type {
  Ticket,
  TicketCambios,
} from '../../../dominio/modelo/Ticket'

import type {
  RepositorioTicket,
} from '../../../dominio/puertos/RepositorioTicket'

import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

import {
  ProductoInexistente,
  StockInsuficiente,
} from './CrearTicket'

import {
  DatosTicketInvalidos,
  TicketNoEditable,
  TicketNoEncontrado,
} from './errores'

/** Caso de uso para editar un ticket PENDIENTE. */
export class EditarTicket {
  constructor(
    private readonly tickets: RepositorioTicket,
    private readonly productos: RepositorioProducto,
  ) {}

  async ejecutar(id: number, cambios: TicketCambios): Promise<Ticket> {
    const limpios = this.validar(cambios)
    const ticket = await this.tickets.obtenerPorId(id)

    if (!ticket) throw new TicketNoEncontrado(id)
    if (ticket.estado !== 'PENDIENTE') {
      throw new TicketNoEditable(ticket.estado)
    }

    if (limpios.productoId !== undefined || limpios.cantidad !== undefined) {
      const productoId = limpios.productoId ?? ticket.productoId
      const cantidad = limpios.cantidad ?? ticket.cantidad
      const producto = await this.productos.obtenerPorId(productoId)

      if (!producto) throw new ProductoInexistente(productoId)
      if (producto.stock < cantidad) {
        throw new StockInsuficiente(cantidad, producto.stock)
      }
    }

    const actualizado = await this.tickets.actualizar(id, limpios)
    if (!actualizado) throw new TicketNoEncontrado(id)
    return actualizado
  }

  private validar(cambios: TicketCambios): TicketCambios {
    const limpios: TicketCambios = {}

    if (cambios.titulo !== undefined) {
      if (!cambios.titulo.trim()) {
        throw new DatosTicketInvalidos('El título del ticket es obligatorio')
      }
      limpios.titulo = cambios.titulo.trim()
    }

    if (cambios.descripcion !== undefined) {
      limpios.descripcion = cambios.descripcion.trim()
    }

    if (cambios.productoId !== undefined) {
      if (!Number.isInteger(cambios.productoId) || cambios.productoId <= 0) {
        throw new DatosTicketInvalidos('productoId inválido')
      }
      limpios.productoId = cambios.productoId
    }

    if (cambios.cantidad !== undefined) {
      if (!Number.isInteger(cambios.cantidad) || cambios.cantidad <= 0) {
        throw new DatosTicketInvalidos(
          'La cantidad debe ser un entero mayor que cero',
        )
      }
      limpios.cantidad = cambios.cantidad
    }

    if (Object.keys(limpios).length === 0) {
      throw new DatosTicketInvalidos('No se envió ningún campo para modificar')
    }

    return limpios
  }
}
