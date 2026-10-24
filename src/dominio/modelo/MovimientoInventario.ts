/** Tipos de operación que modifican el inventario. */
export const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA'] as const
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number]

/** Movimiento individual usado para calcular el saldo del producto. */
export interface MovimientoInventario {
  id: number
  productoId: number
  tipo: TipoMovimiento
  cantidad: number
  motivo: string
  fecha: Date
}

/** Movimiento pendiente de registrar; SQL Server asigna id y fecha. */
export type MovimientoNuevo = Omit<MovimientoInventario, 'id' | 'fecha'>

/** Indica si el movimiento suma o resta unidades del saldo. */
export function signoDe(tipo: TipoMovimiento): 1 | -1 {
  return tipo === 'ENTRADA' ? 1 : -1
}
