import { Router } from 'express'

import { ProductoController } from '../controladores/ProductoController'

/**
 * Rutas de productos.
 */
export function productoRoutes(
  controller: ProductoController,
): Router {
  const router = Router()

  router.post('/', controller.crear)

  router.get('/', controller.consultarTodos)

  return router
}
