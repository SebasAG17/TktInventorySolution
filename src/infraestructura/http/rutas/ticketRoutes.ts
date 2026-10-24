import { Router } from 'express'

import { TicketController } from '../controladores/TicketController'

/**
 * Rutas de tickets.
 */
export function ticketRoutes(
  controller: TicketController,
): Router {
  const router = Router()

  router.post('/', controller.crear)

  router.get('/', controller.consultarTodos)

  router.get('/:id', controller.consultarPorId)

  router.put('/:id', controller.editar)

  router.patch('/:id/aprobar', controller.aprobar)

  router.patch('/:id/cancelar', controller.cancelar)

  return router
}
