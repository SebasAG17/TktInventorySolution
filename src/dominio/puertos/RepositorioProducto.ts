import type {
  Producto,
  ProductoCambios,
  ProductoNuevo,
} from '../modelo/Producto'

/**
 * Puerto del dominio para acceder a los productos.
 *
 * El dominio conoce este contrato, pero no sabe
 * si los datos vienen de SQL Server, MySQL,
 * PostgreSQL, una API, etc.
 */
export interface RepositorioProducto {
  crear(producto: ProductoNuevo): Promise<Producto>

  obtenerTodos(): Promise<Producto[]>

  obtenerPorId(id: number): Promise<Producto | null>

  /**
   * Aplica cambios parciales a un producto existente y
   * devuelve cómo quedó, o null si el producto no existe.
   */
  actualizar(
    id: number,
    cambios: ProductoCambios,
  ): Promise<Producto | null>
}
