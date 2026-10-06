import type {
  MovimientoInventario,
  MovimientoNuevo,
} from '../../../dominio/modelo/MovimientoInventario'

import type {
  RepositorioMovimiento,
} from '../../../dominio/puertos/RepositorioMovimiento'

import { ConexionSqlServer } from './ConexionSqlServer'

/**
 * Adaptador que implementa RepositorioMovimiento
 * utilizando SQL Server.
 */
export class RepositorioMovimientoSqlServer
  implements RepositorioMovimiento
{
  async registrar(
    movimiento: MovimientoNuevo,
  ): Promise<MovimientoInventario> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('productoId', movimiento.productoId)
      .input('tipo', movimiento.tipo)
      .input('cantidad', movimiento.cantidad)
      .input('motivo', movimiento.motivo)
      .query(`
        INSERT INTO MovimientoInventario
        (
          productoId,
          tipo,
          cantidad,
          motivo
        )
        OUTPUT
          INSERTED.id,
          INSERTED.productoId,
          INSERTED.tipo,
          INSERTED.cantidad,
          INSERTED.motivo,
          INSERTED.fecha
        VALUES
        (
          @productoId,
          @tipo,
          @cantidad,
          @motivo
        )
      `)

    return resultado.recordset[0] as MovimientoInventario
  }

  async obtenerPorProducto(
    productoId: number,
  ): Promise<MovimientoInventario[]> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('productoId', productoId)
      .query(`
        SELECT
          id,
          productoId,
          tipo,
          cantidad,
          motivo,
          fecha
        FROM MovimientoInventario
        WHERE productoId = @productoId
        ORDER BY fecha DESC, id DESC
      `)

    return resultado.recordset as MovimientoInventario[]
  }

  async obtenerTodos(): Promise<MovimientoInventario[]> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .query(`
        SELECT
          id,
          productoId,
          tipo,
          cantidad,
          motivo,
          fecha
        FROM MovimientoInventario
        ORDER BY fecha DESC, id DESC
      `)

    return resultado.recordset as MovimientoInventario[]
  }
}
