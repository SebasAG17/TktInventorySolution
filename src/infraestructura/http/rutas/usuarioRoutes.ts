import { Router } from 'express'
import type { ServicioTokens } from '../../../dominio/puertos/ServicioTokens'
import { UsuarioController } from '../controladores/UsuarioController'
import { exigirSesion } from '../middlewares/exigirSesion'

export function usuarioRoutes(controller: UsuarioController, tokens: ServicioTokens): Router {
  const router = Router()
  router.use(exigirSesion(tokens))
  router.put('/:id', controller.actualizar)
  router.delete('/:id', controller.eliminar)
  return router
}
