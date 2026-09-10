import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'

import { esRol } from '../../dominio/modelo/Usuario'

import type {
  CredencialDTO,
  ServicioTokens,
} from '../../dominio/puertos/ServicioTokens'

/**
 * Adaptador que implementa ServicioTokens con JWT (HS256).
 */
export class TokensJwt implements ServicioTokens {
  constructor(
    private readonly secreto: string,
    private readonly duracion: NonNullable<
      SignOptions['expiresIn']
    > = '8h',
  ) {}

  emitir({ id, rol }: CredencialDTO): string {
    return jwt.sign({ rol }, this.secreto, {
      subject: String(id),
      expiresIn: this.duracion,
    })
  }

  verificar(token: string): CredencialDTO | null {
    try {
      const carga = jwt.verify(token, this.secreto)

      if (typeof carga === 'string' || !carga.sub) return null
      if (!esRol(carga.rol)) return null

      const id = Number(carga.sub)
      if (!Number.isInteger(id)) return null

      return { id, rol: carga.rol }
    } catch {
      // Token expirado, mal formado o con firma inválida.
      return null
    }
  }
}
