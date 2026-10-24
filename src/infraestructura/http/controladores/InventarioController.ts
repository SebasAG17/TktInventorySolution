import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import { ConsultarInventario } from '../../../aplicacion/casos-uso/inventario/ConsultarInventario'
import { ProductoNoEncontrado } from '../../../aplicacion/casos-uso/productos/ActualizarProducto'

export class InventarioController {
  constructor(
    private readonly consultarInventario: ConsultarInventario,
  ) {}

  consultarTodos = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res.json(await this.consultarInventario.ejecutar())
    } catch (error) {
      next(error)
    }
  }

  consultarPorProducto = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const productoId = Number(req.params.productoId)

    if (!Number.isInteger(productoId) || productoId < 1) {
      res.status(400).json({ error: 'productoId inválido' })
      return
    }

    try {
      res.json(
        await this.consultarInventario.ejecutarPorProducto(productoId),
      )
    } catch (error) {
      if (error instanceof ProductoNoEncontrado) {
        res.status(404).json({ error: error.message })
        return
      }

      next(error)
    }
  }
}
