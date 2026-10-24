import type {
  MovimientoInventario,
} from '../modelo/MovimientoInventario'

/** Puerto para consultar los movimientos que forman el inventario. */
export interface RepositorioMovimiento {
  obtenerTodos(): Promise<MovimientoInventario[]>

  obtenerPorProducto(productoId: number): Promise<MovimientoInventario[]>
}
