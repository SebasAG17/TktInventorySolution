import type { RepositorioUsuario } from '../../../dominio/puertos/RepositorioUsuario'
import { AccesoDenegado, UsuarioNoEncontrado } from './errores'

/** Elimina de forma definitiva a un usuario registrado. */
export class EliminarUsuario {
  constructor(private readonly usuarios: RepositorioUsuario) {}

  async ejecutar(solicitanteId: number, id: number): Promise<void> {
    const solicitante = await this.usuarios.obtenerPorId(solicitanteId)
    if (!solicitante || !solicitante.activo) {
      throw new AccesoDenegado('La sesion ya no es valida')
    }
    if (solicitante.rol !== 'ADMINISTRADOR') {
      throw new AccesoDenegado('Solo un administrador puede eliminar usuarios')
    }
    if (solicitanteId === id) {
      throw new AccesoDenegado('Un administrador no puede eliminarse a si mismo')
    }
    const eliminado = await this.usuarios.eliminar(id)
    if (!eliminado) throw new UsuarioNoEncontrado(id)
  }
}
