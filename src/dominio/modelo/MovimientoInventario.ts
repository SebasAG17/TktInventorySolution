/** Tipo de operación que modifica el inventario. */
export type TipoMovimiento = 'ENTRADA' | 'SALIDA'

/** Movimiento individual usado para calcular el saldo del producto. */
export interface MovimientoInventario {
  productoId: number
  tipo: TipoMovimiento
  cantidad: number
}

/** Indica si el movimiento suma o resta unidades del saldo. */
export function signoDe(tipo: TipoMovimiento): 1 | -1 {
  return tipo === 'ENTRADA' ? 1 : -1
}
