import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import {
  aUsuarioDTO,
  esRol,
} from '../../../dominio/modelo/Usuario'

import type { Rol } from '../../../dominio/modelo/Usuario'

import type {
  RepositorioUsuario,
} from '../../../dominio/puertos/RepositorioUsuario'

import {
  CorreoYaRegistrado,
  RegistrarUsuario,
} from '../../../aplicacion/casos-uso/usuarios/RegistrarUsuario'

import type {
  RegistroDTO,
} from '../../../aplicacion/casos-uso/usuarios/RegistrarUsuario'

import {
  CredencialesInvalidas,
  IniciarSesion,
} from '../../../aplicacion/casos-uso/usuarios/IniciarSesion'

import { credencialDe } from '../middlewares/exigirSesion'

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Datos de entrada del inicio de sesión.
 */
export interface LoginDTO {
  correo: string
  clave: string
}

/**
 * Validación de frontera: lo que entra por HTTP es
 * desconocido hasta que se prueba lo contrario.
 *
 * Devuelve el DTO válido o el mensaje de error.
 */
function validarRegistro(
  cuerpo: unknown,
): RegistroDTO | string {
  const d = (cuerpo ?? {}) as Record<string, unknown>

  if (
    typeof d.nombre !== 'string' ||
    d.nombre.trim().length < 2
  ) {
    return 'nombre requerido (mínimo 2 caracteres)'
  }

  if (
    typeof d.correo !== 'string' ||
    !CORREO.test(d.correo.trim())
  ) {
    return 'correo inválido'
  }

  if (typeof d.clave !== 'string' || d.clave.length < 8) {
    return 'clave requerida (mínimo 8 caracteres)'
  }

  const rol: unknown = d.rol ?? 'SOLICITANTE'
  if (!esRol(rol)) return 'rol inválido'

  return {
    nombre: d.nombre,
    correo: d.correo,
    clave: d.clave,
    rol: rol satisfies Rol,
  }
}

function validarLogin(cuerpo: unknown): LoginDTO | null {
  const d = (cuerpo ?? {}) as Record<string, unknown>

  if (
    typeof d.correo !== 'string' ||
    typeof d.clave !== 'string'
  ) {
    return null
  }

  return { correo: d.correo, clave: d.clave }
}

export class AutenticacionController {
  constructor(
    private readonly registrarUsuario: RegistrarUsuario,
    private readonly iniciarSesion: IniciarSesion,
    private readonly usuarios: RepositorioUsuario,
  ) {}

  registro = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const datos = validarRegistro(req.body)

    if (typeof datos === 'string') {
      res.status(400).json({ error: datos })
      return
    }

    try {
      const usuario = await this.registrarUsuario.ejecutar(
        datos,
      )

      res.status(201).json(aUsuarioDTO(usuario))
    } catch (error) {
      if (error instanceof CorreoYaRegistrado) {
        res.status(409).json({ error: error.message })
        return
      }

      next(error)
    }
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const datos = validarLogin(req.body)

    if (!datos) {
      res.status(400).json({
        error: 'correo y clave son obligatorios',
      })
      return
    }

    try {
      const sesion = await this.iniciarSesion.ejecutar(
        datos.correo,
        datos.clave,
      )

      res.json(sesion)
    } catch (error) {
      if (error instanceof CredencialesInvalidas) {
        res.status(401).json({ error: error.message })
        return
      }

      next(error)
    }
  }

  perfil = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = credencialDe(res)

      // Se relee de la base de datos en cada llamada: si al
      // usuario le cambian el rol o lo desactivan, la
      // respuesta lo refleja sin esperar a que expire el token.
      const usuario = await this.usuarios.obtenerPorId(id)

      if (!usuario) {
        res
          .status(404)
          .json({ error: 'Usuario no encontrado' })
        return
      }

      res.json(aUsuarioDTO(usuario))
    } catch (error) {
      next(error)
    }
  }
}
