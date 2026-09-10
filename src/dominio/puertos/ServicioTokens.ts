import type { Rol } from '../modelo/Usuario'

/**
 * Contenido útil del token: viaja entre el cliente y el
 * servidor en cada petición.
 */
export interface CredencialDTO {
  id: number
  rol: Rol
}

/**
 * Puerto del dominio para emitir y verificar tokens de
 * sesión, sin atarse a JWT ni a ninguna librería.
 */
export interface ServicioTokens {
  emitir(credencial: CredencialDTO): string

  verificar(token: string): CredencialDTO | null
}
