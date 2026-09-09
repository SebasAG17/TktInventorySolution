import express from 'express'

import type { RepositorioProducto } from '../../dominio/puertos/RepositorioProducto'
import type { RepositorioTicket } from '../../dominio/puertos/RepositorioTicket'

import { productoRoutes } from './rutas/productoRoutes'

export interface DependenciasServidor {
  productos: RepositorioProducto
  tickets: RepositorioTicket
}

export function crearServidor(
  deps: DependenciasServidor,
) {
  const app = express()

  app.use(express.json())

  app.get('/api', (_req, res) => {
    res.json({
      mensaje: 'TktInventorySolution funcionando',
    })
  })

  app.use(
    '/api/productos',
    productoRoutes(deps.productos),
  )


  return app
}