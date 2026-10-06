import type { Request, Response } from 'express'

import type {
  ProductoCambios,
} from '../../../dominio/modelo/Producto'

import { CrearProducto } from '../../../aplicacion/casos-uso/productos/CrearProducto'
import { ConsultarProductos } from '../../../aplicacion/casos-uso/productos/ConsultarProductos'
import {
  ActualizarProducto,
  ProductoNoEncontrado,
} from '../../../aplicacion/casos-uso/productos/ActualizarProducto'

/**
 * Validación de frontera: del cuerpo solo se toman los
 * campos conocidos, y solo si vienen con el tipo correcto.
 * Lo demás se ignora en vez de llegar al caso de uso.
 */
function leerCambios(cuerpo: unknown): ProductoCambios {
  const d = (cuerpo ?? {}) as Record<string, unknown>
  const cambios: ProductoCambios = {}

  if (typeof d.nombre === 'string') cambios.nombre = d.nombre
  if (typeof d.descripcion === 'string') {
    cambios.descripcion = d.descripcion
  }
  if (d.precio !== undefined && !Number.isNaN(Number(d.precio))) {
    cambios.precio = Number(d.precio)
  }
  if (d.stock !== undefined && !Number.isNaN(Number(d.stock))) {
    cambios.stock = Number(d.stock)
  }
  if (typeof d.activo === 'boolean') cambios.activo = d.activo

  return cambios
}

export class ProductoController {
  constructor(
    private readonly crearProducto: CrearProducto,
    private readonly consultarProductos: ConsultarProductos,
    private readonly actualizarProducto: ActualizarProducto,
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

  actualizar = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'id inválido' })
      return
    }

    try {
      const producto = await this.actualizarProducto.ejecutar(
        id,
        leerCambios(req.body),
      )

      res.json(producto)
    } catch (error) {
      if (error instanceof ProductoNoEncontrado) {
        res.status(404).json({ error: error.message })
        return
      }

      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Error al actualizar producto',
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