import express, { Router } from 'express'
import type { Express } from 'express'

import swaggerUi from 'swagger-ui-express'

import type {
  ServicioTokens,
} from '../../dominio/puertos/ServicioTokens'

import { openapi } from './openapi'

import { AutenticacionController } from './controladores/AutenticacionController'
import { ProductoController } from './controladores/ProductoController'
import { TicketController } from './controladores/TicketController'

import { autenticacionRoutes } from './rutas/autenticacionRoutes'
import { productoRoutes } from './rutas/productoRoutes'
import { ticketRoutes } from './rutas/ticketRoutes'

import {
  manejadorErrores,
  rutaNoEncontrada,
} from './middlewares/manejadorErrores'

/**
 * Todo lo que el servidor necesita para armarse. Lo
 * construye la raíz de composición (`main/app.ts`); aquí
 * solo se cablean las rutas.
 */
export interface DependenciasServidor {
  autenticacion: AutenticacionController
  productos: ProductoController
  tickets: TicketController
  tokens: ServicioTokens
}

export function crearServidor(
  deps: DependenciasServidor,
): Express {
  const api = Router()

  api.get('/salud', (_req, res) => {
    res.json({ estado: 'ok' })
  })

  api.get('/openapi.json', (_req, res) => {
    res.json(openapi)
  })

  api.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customSiteTitle: 'TktInventorySolution · API',
    }),
  )

  api.use(
    '/auth',
    autenticacionRoutes(deps.autenticacion, deps.tokens),
  )

  api.use('/productos', productoRoutes(deps.productos))

  api.use('/tickets', ticketRoutes(deps.tickets))

  const app = express()

  app.use(express.json())

  app.use('/api', api)

  // El orden importa: primero el 404 para lo que ninguna
  // ruta atendió, y de último el manejador de errores.
  app.use(rutaNoEncontrada)

  app.use(manejadorErrores)

  return app
}
