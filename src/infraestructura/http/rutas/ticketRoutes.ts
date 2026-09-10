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

  return router
}
