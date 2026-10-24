import type { RequestHandler } from 'express'

import type { Rol } from '../../../dominio/modelo/Usuario'

import type {
  CredencialDTO,
} from '../../../dominio/puertos/ServicioTokens'

/**
 * Exige que el usuario en sesión tenga alguno de los roles
 * indicados. Va siempre después de `exigirSesion`, que es
 * quien deja la credencial en `res.locals`:
 *
 *   router.delete('/:id', exigirSesion(tokens),
 *     exigirRol('ADMINISTRADOR'), controller.eliminar)
 *
 * Responde 401 si no hay sesión y 403 si la hay pero el rol
 * no está entre los permitidos. El rol sale del token, así
 * que un cambio de rol aplica cuando el token se renueva.
 */
export function exigirRol(...roles: Rol[]): RequestHandler {
  // Sin roles la ruta quedaría cerrada para todos: es un
  // error de cableado y debe fallar al arrancar, no en cada
  // petición.
  if (roles.length === 0) {
    throw new Error('exigirRol necesita al menos un rol')
  }

  return (_req, res, next) => {
    const credencial = res.locals.credencial as
      | CredencialDTO
      | undefined

    if (!credencial) {
      res.status(401).json({ error: 'Sesión requerida' })
      return
    }

    if (!roles.includes(credencial.rol)) {
      res.status(403).json({
        error: `Esta acción requiere el rol ${roles.join(' o ')}`,
      })
      return
    }

    next()
  }
}
