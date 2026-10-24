import type {
  MovimientoInventario,
  MovimientoNuevo,
} from '../modelo/MovimientoInventario'

/** Puerto para consultar los movimientos que forman el inventario. */
export interface RepositorioMovimiento {
  registrar(movimiento: MovimientoNuevo): Promise<MovimientoInventario>

  obtenerTodos(): Promise<MovimientoInventario[]>

  obtenerPorProducto(productoId: number): Promise<MovimientoInventario[]>
}
