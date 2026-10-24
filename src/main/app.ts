// Raíz de composición: el único archivo que puede
// importarlo todo y hacer `new` de las implementaciones
// concretas. Las demás capas solo conocen los puertos.
import { entorno } from '../infraestructura/configuracion/entorno'

import { CrearProducto } from '../aplicacion/casos-uso/productos/CrearProducto'
import { ConsultarProductos } from '../aplicacion/casos-uso/productos/ConsultarProductos'
import { ActualizarProducto } from '../aplicacion/casos-uso/productos/ActualizarProducto'
import { ConsultarInventario } from '../aplicacion/casos-uso/inventario/ConsultarInventario'
import { CrearTicket } from '../aplicacion/casos-uso/tickets/CrearTicket'
import { ConsultarTickets } from '../aplicacion/casos-uso/tickets/ConsultarTickets'
import { ConsultarTicketPorId } from '../aplicacion/casos-uso/tickets/ConsultarTicketPorId'
import { AprobarTicket } from '../aplicacion/casos-uso/tickets/AprobarTicket'
import { CancelarTicket } from '../aplicacion/casos-uso/tickets/CancelarTicket'
import { RegistrarUsuario } from '../aplicacion/casos-uso/usuarios/RegistrarUsuario'
import { IniciarSesion } from '../aplicacion/casos-uso/usuarios/IniciarSesion'
import { ActualizarUsuario } from '../aplicacion/casos-uso/usuarios/ActualizarUsuario'
import { EliminarUsuario } from '../aplicacion/casos-uso/usuarios/EliminarUsuario'

import { RepositorioProductoSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioProductoSqlServer'
import { RepositorioTicketSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioTicketSqlServer'
import { RepositorioUsuarioSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioUsuarioSqlServer'
import { RepositorioMovimientoSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioMovimientoSqlServer'

import { ClavesBcrypt } from '../infraestructura/seguridad/ClavesBcrypt'
import { TokensJwt } from '../infraestructura/seguridad/TokensJwt'

import { AutenticacionController } from '../infraestructura/http/controladores/AutenticacionController'
import { ProductoController } from '../infraestructura/http/controladores/ProductoController'
import { TicketController } from '../infraestructura/http/controladores/TicketController'
import { InventarioController } from '../infraestructura/http/controladores/InventarioController'
import { UsuarioController } from '../infraestructura/http/controladores/UsuarioController'

import { crearServidor } from '../infraestructura/http/servidor'

// Adaptadores de salida.
const productos = new RepositorioProductoSqlServer()
const tickets = new RepositorioTicketSqlServer()
const usuarios = new RepositorioUsuarioSqlServer()
const movimientos = new RepositorioMovimientoSqlServer()

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
  new ActualizarProducto(productos),
)

const ticketController = new TicketController(
  new CrearTicket(tickets, productos),
  new ConsultarTickets(tickets),
  new ConsultarTicketPorId(tickets),
  new AprobarTicket(tickets),
  new CancelarTicket(tickets),
)

const inventarioController = new InventarioController(
  new ConsultarInventario(movimientos, productos),
)

const usuarioController = new UsuarioController(
  new ActualizarUsuario(usuarios, claves),
  new EliminarUsuario(usuarios),
)

const app = crearServidor({
  autenticacion: autenticacionController,
  productos: productoController,
  tickets: ticketController,
  inventario: inventarioController,
  usuarios: usuarioController,
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
