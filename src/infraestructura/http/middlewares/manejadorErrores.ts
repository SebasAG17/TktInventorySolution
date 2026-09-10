import type { ErrorRequestHandler, RequestHandler } from 'express'

/**
 * Última red de seguridad: cualquier error que no atrapó
 * un controlador sale como 500 en JSON, no como HTML.
 */
export const manejadorErrores: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  console.error(error)

  res.status(500).json({ error: 'Error interno' })
}

/**
 * Responde 404 en JSON para cualquier ruta no registrada.
 */
export const rutaNoEncontrada: RequestHandler = (
  _req,
  res,
) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
}
