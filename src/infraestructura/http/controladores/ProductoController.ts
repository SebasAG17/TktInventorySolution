import type { Request, Response } from 'express'

import { CrearProducto } from '../../../aplicacion/casos-uso/productos/CrearProducto'
import { ConsultarProductos } from '../../../aplicacion/casos-uso/productos/ConsultarProductos'

export class ProductoController {
  constructor(
    private readonly crearProducto: CrearProducto,
    private readonly consultarProductos: ConsultarProductos,
  ) {}

  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const producto = await this.crearProducto.ejecutar({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion ?? '',
        precio: Number(req.body.precio),
        stock: Number(req.body.stock),
        activo: req.body.activo ?? true,
      })

      res.status(201).json(producto)
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Error al crear producto',
      })
    }
  }

  consultarTodos = async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const productos = await this.consultarProductos.ejecutar()

      res.json(productos)
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Error al consultar productos',
      })
    }
  }
}