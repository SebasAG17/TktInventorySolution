import 'dotenv/config'

import { crearServidor } from '../infraestructura/http/servidor'

import { RepositorioProductoSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioProductoSqlServer'

import { RepositorioTicketSqlServer } from '../infraestructura/persistencia/sqlserver/RepositorioTicketSqlServer'

const productos = new RepositorioProductoSqlServer()

const tickets = new RepositorioTicketSqlServer()

const app = crearServidor({
  productos,
  tickets,
})

const puerto = Number(
  process.env.PORT ?? 3000,
)

app.listen(puerto, () => {
  console.log(
    `TktInventorySolution escuchando en http://localhost:${puerto}`,
  )

  console.log(
    `Productos: http://localhost:${puerto}/api/productos`,
  )

  console.log(
    `Tickets: http://localhost:${puerto}/api/tickets`,
  )
})