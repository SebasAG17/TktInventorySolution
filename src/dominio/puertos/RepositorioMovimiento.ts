import type {
  MovimientoInventario,
  MovimientoNuevo,
} from '../modelo/MovimientoInventario'

/**
 * Puerto del dominio para acceder a los movimientos de
 * inventario.
 *
 * El dominio conoce este contrato, pero no sabe si los
 * movimientos se guardan en SQL Server, en un archivo o
 * en memoria.
 *
 * `obtenerPorProducto` devuelve los movimientos del más
 * reciente al más antiguo.
 */
export interface RepositorioMovimiento {
  registrar(
    movimiento: MovimientoNuevo,
  ): Promise<MovimientoInventario>

  obtenerPorProducto(
    productoId: number,
  ): Promise<MovimientoInventario[]>

  obtenerTodos(): Promise<MovimientoInventario[]>
}
