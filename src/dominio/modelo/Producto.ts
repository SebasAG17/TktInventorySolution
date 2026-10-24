/**
 * Entidad principal del dominio Producto.
 *
 * Esta entidad representa un producto dentro del sistema
 * de inventario.
 */
export interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  activo: boolean
}

/**
 * Producto que todavía no existe en la base de datos.
 * El id será asignado por SQL Server.
 */
export type ProductoNuevo = Omit<Producto, 'id'>

/**
 * Campos que se pueden modificar de un producto existente.
 * El id nunca cambia, así que queda fuera.
 */
export type ProductoCambios = Partial<Omit<Producto, 'id'>>
