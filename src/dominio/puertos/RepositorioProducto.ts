import type {
  Producto,
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
}