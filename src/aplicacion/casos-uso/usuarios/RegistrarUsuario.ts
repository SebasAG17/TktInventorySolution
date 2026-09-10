import type {
  Rol,
  Usuario,
} from '../../../dominio/modelo/Usuario'

import type {
  RepositorioUsuario,
} from '../../../dominio/puertos/RepositorioUsuario'

import type {
  ServicioClaves,
} from '../../../dominio/puertos/ServicioClaves'

/**
 * El correo ya pertenece a otro usuario.
 */
export class CorreoYaRegistrado extends Error {
  constructor(correo: string) {
    super(`El correo ${correo} ya está registrado`)
  }
}

/**
 * Datos de entrada del registro, ya validados
 * en la frontera HTTP.
 */
export interface RegistroDTO {
  nombre: string
  correo: string
  clave: string
  rol: Rol
}

/**
 * Caso de uso para registrar un nuevo usuario.
 */
export class RegistrarUsuario {
  constructor(
    private readonly usuarios: RepositorioUsuario,
    private readonly claves: ServicioClaves,
  ) {}

  async ejecutar(datos: RegistroDTO): Promise<Usuario> {
    const correo = datos.correo.trim().toLowerCase()

    const existente =
      await this.usuarios.obtenerPorCorreo(correo)

    if (existente) {
      throw new CorreoYaRegistrado(correo)
    }

    return this.usuarios.crear({
      nombre: datos.nombre.trim(),
      correo,
      claveHash: await this.claves.cifrar(datos.clave),
      rol: datos.rol,
      activo: true,
    })
  }
}
