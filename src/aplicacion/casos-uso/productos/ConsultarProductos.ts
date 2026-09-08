import type { Producto } from '../../../dominio/modelo/Producto'

import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

/**
 * Caso de uso para consultar todos los productos.
 */
export class ConsultarProductos {
  constructor(
    private readonly productos: RepositorioProducto,
  ) {}

  async ejecutar(): Promise<Producto[]> {
    return this.productos.obtenerTodos()
  }
}