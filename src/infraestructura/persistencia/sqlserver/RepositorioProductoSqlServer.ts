import type {
  Producto,
  ProductoNuevo,
} from '../../../dominio/modelo/Producto'

import type {
  RepositorioProducto,
} from '../../../dominio/puertos/RepositorioProducto'

import { ConexionSqlServer } from './ConexionSqlServer'

/**
 * Adaptador de infraestructura.
 *
 * Implementa el puerto RepositorioProducto utilizando
 * SQL Server.
 */
export class RepositorioProductoSqlServer
  implements RepositorioProducto
{
  async crear(producto: ProductoNuevo): Promise<Producto> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('nombre', producto.nombre)
      .input('descripcion', producto.descripcion)
      .input('precio', producto.precio)
      .input('stock', producto.stock)
      .input('activo', producto.activo)
      .query(`
        INSERT INTO Producto
        (
          nombre,
          descripcion,
          precio,
          stock,
          activo
        )
        OUTPUT
          INSERTED.id,
          INSERTED.nombre,
          INSERTED.descripcion,
          INSERTED.precio,
          INSERTED.stock,
          INSERTED.activo
        VALUES
        (
          @nombre,
          @descripcion,
          @precio,
          @stock,
          @activo
        )
      `)

    return resultado.recordset[0] as Producto
  }

  async obtenerTodos(): Promise<Producto[]> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .query(`
        SELECT
          id,
          nombre,
          descripcion,
          precio,
          stock,
          activo
        FROM Producto
        ORDER BY id
      `)

    return resultado.recordset as Producto[]
  }

  async obtenerPorId(id: number): Promise<Producto | null> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('id', id)
      .query(`
        SELECT
          id,
          nombre,
          descripcion,
          precio,
          stock,
          activo
        FROM Producto
        WHERE id = @id
      `)

    return resultado.recordset[0] ?? null
  }
}