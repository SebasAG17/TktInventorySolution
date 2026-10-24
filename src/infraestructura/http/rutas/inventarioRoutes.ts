import { Router } from 'express'

import { InventarioController } from '../controladores/InventarioController'

/** Rutas para consultar el saldo de inventario. */
export function inventarioRoutes(
  controller: InventarioController,
): Router {
  const router = Router()

  router.get('/', controller.consultarTodos)
  router.get('/:productoId', controller.consultarPorProducto)

  return router
}
