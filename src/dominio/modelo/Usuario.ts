/**
 * Roles permitidos para un usuario del sistema.
 */
export const ROLES = [
  'SOLICITANTE',
  'ALMACENISTA',
  'ADMINISTRADOR',
] as const

export type Rol = (typeof ROLES)[number]

/**
 * Entidad del dominio Usuario.
 *
 * Incluye el hash de la clave porque el dominio necesita
 * compararlo al iniciar sesión, pero ese campo nunca
 * sale del servidor.
 */
export interface Usuario {
  id: number
  nombre: string
  correo: string
  claveHash: string
  rol: Rol
  activo: boolean
}

/**
 * Usuario que todavía no existe en la base de datos.
 * El id será asignado por SQL Server.
 */
export type UsuarioNuevo = Omit<Usuario, 'id'>

/**
 * Lo que sale hacia el exterior: el mismo usuario,
 * nunca el hash de la clave.
 */
export interface UsuarioDTO {
  id: number
  nombre: string
  correo: string
  rol: Rol
  activo: boolean
}

/**
 * Verifica si un valor corresponde a un rol válido.
 */
export function esRol(valor: unknown): valor is Rol {
  return ROLES.includes(valor as Rol)
}

/**
 * Convierte la entidad en el DTO público, descartando
 * el hash de la clave.
 */
export function aUsuarioDTO({
  id,
  nombre,
  correo,
  rol,
  activo,
}: Usuario): UsuarioDTO {
  return { id, nombre, correo, rol, activo }
}
