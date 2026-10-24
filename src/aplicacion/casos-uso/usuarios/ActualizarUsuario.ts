import { esRol } from '../../../dominio/modelo/Usuario'
import type { Usuario, UsuarioCambios } from '../../../dominio/modelo/Usuario'
import type { RepositorioUsuario } from '../../../dominio/puertos/RepositorioUsuario'
import type { ServicioClaves } from '../../../dominio/puertos/ServicioClaves'
import { CorreoYaRegistrado } from './RegistrarUsuario'
import { AccesoDenegado, DatosInvalidos, UsuarioNoEncontrado } from './errores'

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ActualizacionUsuarioDTO {
  nombre?: string
  correo?: string
  clave?: string
  rol?: string
  activo?: boolean
}

export class ActualizarUsuario {
  constructor(
    private readonly usuarios: RepositorioUsuario,
    private readonly claves: ServicioClaves,
  ) {}

  async ejecutar(solicitanteId: number, id: number, datos: ActualizacionUsuarioDTO): Promise<Usuario> {
    const solicitante = await this.usuarios.obtenerPorId(solicitanteId)
    if (!solicitante || !solicitante.activo) throw new AccesoDenegado('La sesión ya no es válida')
    const admin = solicitante.rol === 'ADMINISTRADOR'
    const mismo = solicitanteId === id
    if (!admin && !mismo) throw new AccesoDenegado('Solo un administrador puede modificar a otros usuarios')

    const cambios = await this.validar(datos)
    if (!Object.keys(cambios).length) throw new DatosInvalidos('No se envió ningún campo para modificar')
    if (!admin && (cambios.rol !== undefined || cambios.activo !== undefined)) {
      throw new AccesoDenegado('Solo un administrador puede cambiar el rol o el estado de un usuario')
    }
    if (admin && mismo && ((cambios.rol !== undefined && cambios.rol !== 'ADMINISTRADOR') || cambios.activo === false)) {
      throw new AccesoDenegado('Un administrador no puede quitarse su propio rol ni desactivarse')
    }

    const actual = mismo ? solicitante : await this.usuarios.obtenerPorId(id)
    if (!actual) throw new UsuarioNoEncontrado(id)
    if (cambios.correo !== undefined && cambios.correo !== actual.correo) {
      const otro = await this.usuarios.obtenerPorCorreo(cambios.correo)
      if (otro && otro.id !== id) throw new CorreoYaRegistrado(cambios.correo)
    }
    const actualizado = await this.usuarios.actualizar(id, cambios)
    if (!actualizado) throw new UsuarioNoEncontrado(id)
    return actualizado
  }

  private async validar(datos: ActualizacionUsuarioDTO): Promise<UsuarioCambios> {
    const cambios: UsuarioCambios = {}
    if (datos.nombre !== undefined) {
      const nombre = datos.nombre.trim()
      if (nombre.length < 2) throw new DatosInvalidos('nombre requerido (mínimo 2 caracteres)')
      cambios.nombre = nombre
    }
    if (datos.correo !== undefined) {
      const correo = datos.correo.trim().toLowerCase()
      if (!CORREO.test(correo)) throw new DatosInvalidos('correo inválido')
      cambios.correo = correo
    }
    if (datos.rol !== undefined) {
      if (!esRol(datos.rol)) throw new DatosInvalidos('rol inválido')
      cambios.rol = datos.rol
    }
    if (datos.activo !== undefined) cambios.activo = datos.activo
    if (datos.clave !== undefined) {
      if (datos.clave.length < 8) throw new DatosInvalidos('clave requerida (mínimo 8 caracteres)')
      cambios.claveHash = await this.claves.cifrar(datos.clave)
    }
    return cambios
  }
}
