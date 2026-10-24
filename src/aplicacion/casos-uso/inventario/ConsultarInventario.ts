import { signoDe } from '../../../dominio/modelo/MovimientoInventario'

import type {
  MovimientoInventario,
} from '../../../dominio/modelo/MovimientoInventario'

import type {
  RepositorioMovimiento,
} from '../../../dominio/puertos/RepositorioMovimiento'

import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

import { ProductoNoEncontrado } from '../productos/ActualizarProducto'

/** Saldo calculado de inventario para un producto. */
export interface SaldoProducto {
  productoId: number
  nombre: string
  saldo: number
}

function aporte(movimiento: MovimientoInventario): number {
  return signoDe(movimiento.tipo) * movimiento.cantidad
}

/** Calcula el saldo a partir de las entradas y salidas registradas. */
export class ConsultarInventario {
  constructor(
    private readonly movimientos: RepositorioMovimiento,
    private readonly productos: RepositorioProducto,
  ) {}

  /** Devuelve todos los productos, incluidos los que tienen saldo cero. */
  async ejecutar(): Promise<SaldoProducto[]> {
    const [productos, movimientos] = await Promise.all([
      this.productos.obtenerTodos(),
      this.movimientos.obtenerTodos(),
    ])

    const saldos = new Map<number, number>()

    for (const movimiento of movimientos) {
      saldos.set(
        movimiento.productoId,
        (saldos.get(movimiento.productoId) ?? 0) + aporte(movimiento),
      )
    }

    return productos.map((producto) => ({
      productoId: producto.id,
      nombre: producto.nombre,
      saldo: saldos.get(producto.id) ?? 0,
    }))
  }

  /** Devuelve el saldo de un producto o lanza error si no existe. */
  async ejecutarPorProducto(
    productoId: number,
  ): Promise<SaldoProducto> {
    const producto = await this.productos.obtenerPorId(productoId)

    if (!producto) {
      throw new ProductoNoEncontrado(productoId)
    }

    const movimientos =
      await this.movimientos.obtenerPorProducto(productoId)

    return {
      productoId,
      nombre: producto.nombre,
      saldo: movimientos.reduce(
        (total, movimiento) => total + aporte(movimiento),
        0,
      ),
    }
  }
}
