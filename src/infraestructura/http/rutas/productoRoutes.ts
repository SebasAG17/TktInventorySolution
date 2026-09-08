import { Router } from 'express'

import { CrearProducto } from '../../../aplicacion/casos-uso/productos/CrearProducto'
import { ConsultarProductos } from '../../../aplicacion/casos-uso/productos/ConsultarProductos'

import { ProductoController } from '../controladores/ProductoController'

import type { RepositorioProducto } from '../../../dominio/puertos/RepositorioProducto'

export function productoRoutes(
  repositorio: RepositorioProducto,
): Router {
  const router = Router()

  const crearProducto = new CrearProducto(repositorio)
  const consultarProductos = new ConsultarProductos(repositorio)

  const controller = new ProductoController(
    crearProducto,
    consultarProductos,
  )

  router.post('/', controller.crear)

  router.get('/', controller.consultarTodos)

  return router
}