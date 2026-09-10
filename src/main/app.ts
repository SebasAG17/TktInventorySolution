// Raíz de composición: el único archivo que puede
// importarlo todo y hacer `new` de las implementaciones
// concretas. Las demás capas solo conocen los puertos.
import { entorno } from '../infraestructura/configuracion/entorno'

import { CrearProducto } from '../aplicacion/casos-uso/productos/CrearProducto'
import { ConsultarProductos } from '../aplicacion/casos-uso/productos/ConsultarProductos'
import { CrearTicket } from '../aplicacion/casos-uso/tickets/CrearTicket'
import { ConsultarTickets } from '../aplicacion/casos-uso/tickets/ConsultarTickets'
import { RegistrarUsuario } from '../aplicacion/casos-uso/usuarios/RegistrarUsuario'
import { IniciarSesion } from '../aplicacion/casos-uso/usuarios/IniciarSesion'

import { RepositorioProductoSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioProductoSqlServer'
import { RepositorioTicketSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioTicketSqlServer'
import { RepositorioUsuarioSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioUsuarioSqlServer'

import { ClavesBcrypt } from '../infraestructura/seguridad/ClavesBcrypt'
import { TokensJwt } from '../infraestructura/seguridad/TokensJwt'

import { AutenticacionController } from '../infraestructura/http/controladores/AutenticacionController'
import { ProductoController } from '../infraestructura/http/controladores/ProductoController'
import { TicketController } from '../infraestructura/http/controladores/TicketController'

import { crearServidor } from '../infraestructura/http/servidor'

// Adaptadores de salida.
const productos = new RepositorioProductoSqlServer()
const tickets = new RepositorioTicketSqlServer()
const usuarios = new RepositorioUsuarioSqlServer()

const claves = new ClavesBcrypt()
const tokens = new TokensJwt(entorno.jwtSecret)

// Adaptadores de entrada, con sus casos de uso.
const autenticacionController = new AutenticacionController(
  new RegistrarUsuario(usuarios, claves),
  new IniciarSesion(usuarios, claves, tokens),
  usuarios,
)

const productoController = new ProductoController(
  new CrearProducto(productos),
  new ConsultarProductos(productos),
)

const ticketController = new TicketController(
  new CrearTicket(tickets, productos),
  new ConsultarTickets(tickets),
)

const app = crearServidor({
  autenticacion: autenticacionController,
  productos: productoController,
  tickets: ticketController,
  tokens,
})

const puerto = entorno.puertoHttp

app.listen(puerto, () => {
  console.log(
    `TktInventorySolution escuchando en http://localhost:${puerto}/api`,
  )

  console.log(
    `Documentación: http://localhost:${puerto}/api/docs`,
  )
})
