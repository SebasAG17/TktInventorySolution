import type {
  Usuario,
  UsuarioNuevo,
} from '../modelo/Usuario'

/**
 * Puerto del dominio para acceder a los usuarios.
 *
 * El dominio conoce este contrato, pero no sabe si los
 * datos vienen de SQL Server, MySQL, PostgreSQL, etc.
 */
export interface RepositorioUsuario {
  crear(usuario: UsuarioNuevo): Promise<Usuario>

  obtenerPorCorreo(correo: string): Promise<Usuario | null>

  obtenerPorId(id: number): Promise<Usuario | null>
}
