import type { NextFunction, Request, Response } from 'express'
import { aUsuarioDTO } from '../../../dominio/modelo/Usuario'
import { ActualizarUsuario } from '../../../aplicacion/casos-uso/usuarios/ActualizarUsuario'
import { EliminarUsuario } from '../../../aplicacion/casos-uso/usuarios/EliminarUsuario'
import type { ActualizacionUsuarioDTO } from '../../../aplicacion/casos-uso/usuarios/ActualizarUsuario'
import { CorreoYaRegistrado } from '../../../aplicacion/casos-uso/usuarios/RegistrarUsuario'
import { AccesoDenegado, DatosInvalidos, UsuarioNoEncontrado } from '../../../aplicacion/casos-uso/usuarios/errores'
import { credencialDe } from '../middlewares/exigirSesion'

function leerCambios(cuerpo: unknown): ActualizacionUsuarioDTO {
  const d = (cuerpo ?? {}) as Record<string, unknown>
  const c: ActualizacionUsuarioDTO = {}
  if (typeof d.nombre === 'string') c.nombre = d.nombre
  if (typeof d.correo === 'string') c.correo = d.correo
  if (typeof d.clave === 'string') c.clave = d.clave
  if (typeof d.rol === 'string') c.rol = d.rol
  if (typeof d.activo === 'boolean') c.activo = d.activo
  return c
}
function leerId(req: Request): number | null {
  const id = Number(req.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}
function responderError(error: unknown, res: Response): boolean {
  const estado = error instanceof DatosInvalidos ? 400
    : error instanceof AccesoDenegado ? 403
      : error instanceof UsuarioNoEncontrado ? 404
        : error instanceof CorreoYaRegistrado ? 409 : null
  if (estado === null || !(error instanceof Error)) return false
  res.status(estado).json({ error: error.message })
  return true
}
export class UsuarioController {
  constructor(
    private readonly actualizarUsuario: ActualizarUsuario,
    private readonly eliminarUsuario: EliminarUsuario,
  ) {}
  actualizar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = leerId(req)
    if (id === null) { res.status(400).json({ error: 'id inválido' }); return }
    try {
      const usuario = await this.actualizarUsuario.ejecutar(
        credencialDe(res).id, id, leerCambios(req.body),
      )
      res.json(aUsuarioDTO(usuario))
    } catch (error) {
      if (!responderError(error, res)) next(error)
    }
  }

  eliminar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = leerId(req)
    if (id === null) { res.status(400).json({ error: 'id invalido' }); return }
    try {
      await this.eliminarUsuario.ejecutar(credencialDe(res).id, id)
      res.status(204).end()
    } catch (error) {
      if (!responderError(error, res)) next(error)
    }
  }
}
