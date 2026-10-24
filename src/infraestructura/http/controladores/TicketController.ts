import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import {
  esEstadoTicket,
} from '../../../dominio/modelo/EstadoTicket'

import {
  CrearTicket,
  ProductoInexistente,
  StockInsuficiente,
} from '../../../aplicacion/casos-uso/tickets/CrearTicket'
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
      // Cada error de dominio lleva su propia identidad, así
      // que el código HTTP sale de la clase y no del texto.
      if (error instanceof ProductoInexistente) {
        res.status(404).json({ error: error.message })
        return
      }

      if (error instanceof StockInsuficiente) {
        res.status(409).json({ error: error.message })
        return
      }

      // El resto son validaciones de entrada (título vacío,
      // cantidad inválida): culpa del solicitante.
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
