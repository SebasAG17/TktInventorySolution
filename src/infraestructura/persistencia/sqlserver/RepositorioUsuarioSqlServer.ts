import type {
  Usuario,
  UsuarioNuevo,
} from '../../../dominio/modelo/Usuario'

import type {
  RepositorioUsuario,
} from '../../../dominio/puertos/RepositorioUsuario'

import { ConexionSqlServer } from './ConexionSqlServer'

/**
 * Adaptador de infraestructura.
 *
 * Implementa el puerto RepositorioUsuario utilizando
 * SQL Server.
 */
export class RepositorioUsuarioSqlServer
  implements RepositorioUsuario
{
  async crear(usuario: UsuarioNuevo): Promise<Usuario> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('nombre', usuario.nombre)
      .input('correo', usuario.correo)
      .input('claveHash', usuario.claveHash)
      .input('rol', usuario.rol)
      .input('activo', usuario.activo)
      .query(`
        INSERT INTO Usuario
        (
          nombre,
          correo,
          claveHash,
          rol,
          activo
        )
        OUTPUT
          INSERTED.id,
          INSERTED.nombre,
          INSERTED.correo,
          INSERTED.claveHash,
          INSERTED.rol,
          INSERTED.activo
        VALUES
        (
          @nombre,
          @correo,
          @claveHash,
          @rol,
          @activo
        )
      `)

    return resultado.recordset[0] as Usuario
  }

  async obtenerPorCorreo(
    correo: string,
  ): Promise<Usuario | null> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('correo', correo)
      .query(`
        SELECT
          id,
          nombre,
          correo,
          claveHash,
          rol,
          activo
        FROM Usuario
        WHERE correo = @correo
      `)

    return resultado.recordset[0] ?? null
  }

  async obtenerPorId(id: number): Promise<Usuario | null> {
    const conexion = await ConexionSqlServer.obtenerPool()

    const resultado = await conexion
      .request()
      .input('id', id)
      .query(`
        SELECT
          id,
          nombre,
          correo,
          claveHash,
          rol,
          activo
        FROM Usuario
        WHERE id = @id
      `)

    return resultado.recordset[0] ?? null
  }
}
