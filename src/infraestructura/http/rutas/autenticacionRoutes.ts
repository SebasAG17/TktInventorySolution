import { Router } from 'express'

import type {
  ServicioTokens,
} from '../../../dominio/puertos/ServicioTokens'

import { AutenticacionController } from '../controladores/AutenticacionController'
import { exigirSesion } from '../middlewares/exigirSesion'

/**
 * Rutas de autenticación.
 *
 * `/registro` y `/login` son públicas; `/perfil` exige un
 * token válido.
 */
export function autenticacionRoutes(
  controller: AutenticacionController,
  tokens: ServicioTokens,
): Router {
  const router = Router()

  router.post('/registro', controller.registro)

  router.post('/login', controller.login)

  router.get(
    '/perfil',
    exigirSesion(tokens),
    controller.perfil,
  )

  return router
}
