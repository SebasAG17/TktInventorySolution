export class UsuarioNoEncontrado extends Error {
  constructor(id: number) { super('No existe el usuario ' + id) }
}
export class AccesoDenegado extends Error {}
export class DatosInvalidos extends Error {}
