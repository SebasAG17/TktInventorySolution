import type {
  Producto,
  ProductoNuevo,
} from '../../../dominio/modelo/Producto'

import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

/**
 * Caso de uso para registrar un nuevo producto.
 */
export class CrearProducto {
  constructor(
    private readonly productos: RepositorioProducto,
  ) {}

  async ejecutar(datos: ProductoNuevo): Promise<Producto> {
    if (!datos.nombre.trim()) {
      throw new Error('El nombre del producto es obligatorio')
    }

    if (datos.precio < 0) {
      throw new Error('El precio no puede ser negativo')
    }

    if (datos.stock < 0) {
      throw new Error('El stock no puede ser negativo')
    }

    return this.productos.crear({
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      precio: datos.precio,
      stock: datos.stock,
      activo: datos.activo,
    })
  }
}