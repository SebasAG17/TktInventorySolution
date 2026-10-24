import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import {
  esEstadoTicket,
} from '../../../dominio/modelo/EstadoTicket'

import type { TicketCambios } from '../../../dominio/modelo/Ticket'

import {
  CrearTicket,
  ProductoInexistente,
  StockInsuficiente,
} from '../../../aplicacion/casos-uso/tickets/CrearTicket'
import { ConsultarTickets } from '../../../aplicacion/casos-uso/tickets/ConsultarTickets'
import { EditarTicket } from '../../../aplicacion/casos-uso/tickets/EditarTicket'
import {
  DatosTicketInvalidos,
  TicketNoEditable,
  TicketNoEncontrado,
} from '../../../aplicacion/casos-uso/tickets/errores'

/** Convierte y valida los campos editables recibidos por HTTP. */
function leerCambios(cuerpo: Record<string, unknown>): TicketCambios {
  const cambios: TicketCambios = {}

  if (cuerpo.titulo !== undefined) {
    if (typeof cuerpo.titulo !== 'string') {
      throw new DatosTicketInvalidos('título inválido')
    }
    cambios.titulo = cuerpo.titulo
  }

  if (cuerpo.descripcion !== undefined) {
    if (typeof cuerpo.descripcion !== 'string') {
      throw new DatosTicketInvalidos('descripción inválida')
    }
    cambios.descripcion = cuerpo.descripcion
  }

  if (cuerpo.productoId !== undefined) {
    cambios.productoId = Number(cuerpo.productoId)
  }

  if (cuerpo.cantidad !== undefined) {
    cambios.cantidad = Number(cuerpo.cantidad)
  }

  return cambios
}

export class TicketController {
  constructor(
    private readonly crearTicket: CrearTicket,
    private readonly consultarTickets: ConsultarTickets,
    private readonly editarTicket: EditarTicket,
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

  editar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const cuerpo = req.body

    if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
      res.status(400).json({ error: 'El cuerpo debe ser un objeto JSON' })
      return
    }

    if (cuerpo.estado !== undefined) {
      res.status(400).json({
        error: 'El estado no se edita aquí: usa /aprobar o /cancelar',
      })
      return
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'id inválido' })
      return
    }

    try {
      const ticket = await this.editarTicket.ejecutar(
        id,
        leerCambios(cuerpo as Record<string, unknown>),
      )
      res.json(ticket)
    } catch (error) {
      if (error instanceof DatosTicketInvalidos) {
        res.status(400).json({ error: error.message })
        return
      }
      if (error instanceof TicketNoEncontrado || error instanceof ProductoInexistente) {
        res.status(404).json({ error: error.message })
        return
      }
      if (error instanceof TicketNoEditable || error instanceof StockInsuficiente) {
        res.status(409).json({ error: error.message })
        return
      }
      next(error)
    }
  }
}
