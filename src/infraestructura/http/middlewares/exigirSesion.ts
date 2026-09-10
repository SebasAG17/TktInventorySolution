import type { RequestHandler } from 'express'

import type {
  CredencialDTO,
  ServicioTokens,
} from '../../../dominio/puertos/ServicioTokens'

/**
 * Exige un token válido y deja la credencial en
 * `res.locals.credencial` para el resto de la cadena.
 */
export function exigirSesion(
  tokens: ServicioTokens,
): RequestHandler {
  return (req, res, next) => {
    const encabezado = req.headers.authorization ?? ''

    const credencial = tokens.verificar(
      encabezado.replace(/^Bearer /, ''),
    )

    if (!credencial) {
      res.status(401).json({ error: 'Sesión requerida' })
      return
    }

    res.locals.credencial = credencial
    next()
  }
}

/**
 * Lee la credencial que dejó `exigirSesion`.
 */
export function credencialDe(
  res: { locals: Record<string, unknown> },
): CredencialDTO {
  return res.locals.credencial as CredencialDTO
}
