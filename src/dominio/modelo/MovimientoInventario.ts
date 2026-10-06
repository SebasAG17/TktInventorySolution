/**
 * Tipos de movimiento que puede tener el inventario.
 */
export const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA'] as const

export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number]

/**
 * Entidad del dominio MovimientoInventario.
 *
 * Cada entrada o salida queda registrada como una fila: el
 * stock del producto es la suma de sus movimientos, no un
 * número que alguien edita a mano.
 */
export interface MovimientoInventario {
  id: number
  productoId: number
  tipo: TipoMovimiento
  cantidad: number
  motivo: string
  fecha: Date
}

/**
 * Movimiento que todavía no existe.
 * El id y la fecha los genera la base de datos.
 */
export type MovimientoNuevo = Omit<
  MovimientoInventario,
  'id' | 'fecha'
>

/**
 * Verifica si un valor corresponde a un tipo válido.
 */
export function esTipoMovimiento(
  valor: unknown,
): valor is TipoMovimiento {
  return TIPOS_MOVIMIENTO.includes(valor as TipoMovimiento)
}

/**
 * Cuánto suma o resta un movimiento al saldo del producto.
 * Una ENTRADA suma, una SALIDA resta.
 */
export function signoDe(tipo: TipoMovimiento): 1 | -1 {
  return tipo === 'ENTRADA' ? 1 : -1
}
