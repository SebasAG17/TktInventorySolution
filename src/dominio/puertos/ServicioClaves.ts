/**
 * Puerto del dominio para el cifrado de claves.
 *
 * El dominio exige poder cifrar y comparar, pero no
 * decide con qué algoritmo se hace.
 */
export interface ServicioClaves {
  cifrar(clave: string): Promise<string>

  coincide(clave: string, hash: string): Promise<boolean>
}
