import { Router } from 'express'

import type {
  ServicioTokens,
} from '../../../dominio/puertos/ServicioTokens'

import { ProductoController } from '../controladores/ProductoController'
import { exigirSesion } from '../middlewares/exigirSesion'
import { exigirRol } from '../middlewares/exigirRol'

/**
 * Rutas de productos.
 *
 * Consultar, crear y actualizar siguen públicas; eliminar
 * exige sesión de ADMINISTRADOR.
 */
export function productoRoutes(
  controller: ProductoController,
  tokens: ServicioTokens,
): Router {
  const router = Router()

  router.post('/', controller.crear)

  router.get('/', controller.consultarTodos)

  router.put('/:id', controller.actualizar)

  router.delete(
    '/:id',
    exigirSesion(tokens),
    exigirRol('ADMINISTRADOR'),
    controller.eliminar,
  )

  return router
}
