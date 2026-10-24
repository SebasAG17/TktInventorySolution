import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

import type {
  RepositorioTicket,
} from '../../../dominio/puertos/RepositorioTicket'

import type {
  RepositorioMovimiento,
} from '../../../dominio/puertos/RepositorioMovimiento'

import { ProductoNoEncontrado } from './ActualizarProducto'

/**
 * El producto tiene tickets o movimientos de inventario que
 * lo referencian, así que borrarlo dejaría historia huérfana.
 */
export class ProductoEnUso extends Error {
  constructor(
    readonly id: number,
    readonly tickets: number,
    readonly movimientos: number,
  ) {
    super(
      `El producto ${id} tiene ${tickets} ticket(s) y ${movimientos} ` +
        'movimiento(s) de inventario; desactívalo en vez de eliminarlo',
    )
  }
}

/**
 * Caso de uso para eliminar un producto registrado.
 *
 * Solo se borra un producto que nadie referencia. Si ya tiene
 * tickets o movimientos, su historia debe conservarse: para
 * sacarlo del catálogo está `ActualizarProducto` con
 * `activo: false`.
 */
export class EliminarProducto {
  constructor(
    private readonly productos: RepositorioProducto,
    private readonly tickets: RepositorioTicket,
    private readonly movimientos: RepositorioMovimiento,
  ) {}

  async ejecutar(id: number): Promise<void> {
    const producto = await this.productos.obtenerPorId(id)

    if (!producto) {
      throw new ProductoNoEncontrado(id)
    }

    const [tickets, movimientos] = await Promise.all([
      this.tickets.contarPorProducto(id),
      this.movimientos.obtenerPorProducto(id),
    ])

    if (tickets > 0 || movimientos.length > 0) {
      throw new ProductoEnUso(id, tickets, movimientos.length)
    }

    const eliminado = await this.productos.eliminar(id)

    if (!eliminado) {
      throw new ProductoNoEncontrado(id)
    }
  }
}
