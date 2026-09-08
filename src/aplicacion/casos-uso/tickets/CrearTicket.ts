import type {
  Ticket,
  TicketNuevo,
} from '../../../dominio/modelo/ticket'

import type {
  RepositorioTicket,
} from '../../../dominio/puertos/RepositorioTicket'

import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

/**
 * Caso de uso para crear un ticket.
 */
export class CrearTicket {
  constructor(
    private readonly tickets: RepositorioTicket,
    private readonly productos: RepositorioProducto,
  ) {}

  async ejecutar(datos: TicketNuevo): Promise<Ticket> {
    if (!datos.titulo.trim()) {
      throw new Error('El título del ticket es obligatorio')
    }

    if (datos.cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor que cero')
    }

    const producto = await this.productos.obtenerPorId(
      datos.productoId,
    )

    if (!producto) {
      throw new Error('El producto no existe')
    }

    if (producto.stock < datos.cantidad) {
      throw new Error('No hay suficiente stock del producto')
    }

    return this.tickets.crear({
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      estado: datos.estado,
      productoId: datos.productoId,
      cantidad: datos.cantidad,
    })
  }
}