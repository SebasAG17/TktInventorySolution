import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import {
  esEstadoTicket,
} from '../../../dominio/modelo/EstadoTicket'

import { CrearTicket } from '../../../aplicacion/casos-uso/tickets/CrearTicket'
import { ConsultarTickets } from '../../../aplicacion/casos-uso/tickets/ConsultarTickets'

export class TicketController {
  constructor(
    private readonly crearTicket: CrearTicket,
    private readonly consultarTickets: ConsultarTickets,
  ) {}

  crear = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const estado = req.body?.estado ?? 'PENDIENTE'

    if (!esEstadoTicket(estado)) {
      res.status(400).json({ error: 'estado inválido' })
      return
    }

    try {
      const ticket = await this.crearTicket.ejecutar({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion ?? '',
        estado,
        productoId: Number(req.body.productoId),
        cantidad: Number(req.body.cantidad),
      })

      res.status(201).json(ticket)
    } catch (error) {
      // Las reglas de CrearTicket (título vacío, cantidad
      // inválida, producto inexistente, stock insuficiente)
      // son errores del solicitante, no del servidor.
      if (error instanceof Error) {
        res.status(400).json({ error: error.message })
        return
      }

      next(error)
    }
  }

  consultarTodos = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res.json(await this.consultarTickets.ejecutar())
    } catch (error) {
      next(error)
    }
  }
}
