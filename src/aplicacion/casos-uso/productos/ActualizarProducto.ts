import type {
  Producto,
  ProductoCambios,
} from '../../../dominio/modelo/Producto'

import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

/**
 * El producto que se quiere modificar no existe.
 */
export class ProductoNoEncontrado extends Error {
  constructor(id: number) {
    super(`No existe el producto ${id}`)
    this.name = 'ProductoNoEncontrado'
  }
}

/**
 * Caso de uso para modificar un producto existente.
 * Acepta cambios parciales y valida solo los campos recibidos.
 */
export class ActualizarProducto {
  constructor(
    private readonly productos: RepositorioProducto,
  ) {}

  async ejecutar(
    id: number,
    cambios: ProductoCambios,
  ): Promise<Producto> {
    const limpios: ProductoCambios = {}

    if (cambios.nombre !== undefined) {
      if (!cambios.nombre.trim()) {
        throw new Error('El nombre del producto es obligatorio')
      }
      limpios.nombre = cambios.nombre.trim()
    }

    if (cambios.descripcion !== undefined) {
      limpios.descripcion = cambios.descripcion.trim()
    }

    if (cambios.precio !== undefined) {
      if (cambios.precio < 0) {
        throw new Error('El precio no puede ser negativo')
      }
      limpios.precio = cambios.precio
    }

    if (cambios.stock !== undefined) {
      if (!Number.isInteger(cambios.stock) || cambios.stock < 0) {
        throw new Error('El stock debe ser un entero no negativo')
      }
      limpios.stock = cambios.stock
    }

    if (cambios.activo !== undefined) {
      limpios.activo = cambios.activo
    }

    if (Object.keys(limpios).length === 0) {
      throw new Error('No se envió ningún campo para modificar')
    }

    const actualizado = await this.productos.actualizar(id, limpios)

    if (!actualizado) {
      throw new ProductoNoEncontrado(id)
    }

    return actualizado
  }
}
