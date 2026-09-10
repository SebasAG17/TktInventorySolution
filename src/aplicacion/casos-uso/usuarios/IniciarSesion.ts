import { aUsuarioDTO } from '../../../dominio/modelo/Usuario'

import type {
  UsuarioDTO,
} from '../../../dominio/modelo/Usuario'

import type {
  RepositorioUsuario,
} from '../../../dominio/puertos/RepositorioUsuario'

import type {
  ServicioClaves,
} from '../../../dominio/puertos/ServicioClaves'

import type {
  ServicioTokens,
} from '../../../dominio/puertos/ServicioTokens'

/**
 * Credenciales incorrectas o usuario inactivo.
 */
export class CredencialesInvalidas extends Error {
  constructor() {
    super('Correo o clave incorrectos')
  }
}

/**
 * Resultado de un inicio de sesión: el token y
 * quién es su dueño.
 */
export interface SesionDTO {
  token: string
  usuario: UsuarioDTO
}

/**
 * Caso de uso para iniciar sesión.
 */
export class IniciarSesion {
  constructor(
    private readonly usuarios: RepositorioUsuario,
    private readonly claves: ServicioClaves,
    private readonly tokens: ServicioTokens,
  ) {}

  async ejecutar(
    correo: string,
    clave: string,
  ): Promise<SesionDTO> {
    const usuario = await this.usuarios.obtenerPorCorreo(
      correo.trim().toLowerCase(),
    )

    // Un solo error para «no existe», «inactivo» y «clave
    // mala»: así no se filtra qué correos están registrados.
    if (!usuario || !usuario.activo) {
      throw new CredencialesInvalidas()
    }

    const coincide = await this.claves.coincide(
      clave,
      usuario.claveHash,
    )

    if (!coincide) {
      throw new CredencialesInvalidas()
    }

    return {
      token: this.tokens.emitir({
        id: usuario.id,
        rol: usuario.rol,
      }),
      usuario: aUsuarioDTO(usuario),
    }
  }
}
