import { ROLES } from '../../dominio/modelo/Usuario'
import { ESTADOS_TICKET } from '../../dominio/modelo/EstadoTicket'

const usuario = {
  type: 'object',
  description:
    'Usuario del sistema tal como viaja por HTTP (`UsuarioDTO`): la entidad del dominio sin el ' +
    'hash de la clave, que nunca sale del servidor.',
  properties: {
    id: { type: 'integer', example: 1 },
    nombre: { type: 'string', example: 'Ana Almacenista' },
    correo: { type: 'string', format: 'email', example: 'ana@empresa.com' },
    rol: { type: 'string', enum: ROLES, example: 'ALMACENISTA' },
    activo: { type: 'boolean', example: true },
  },
  required: ['id', 'nombre', 'correo', 'rol', 'activo'],
}

const sesion = {
  type: 'object',
  description: 'Resultado de un inicio de sesión: el token y el usuario dueño de la sesión.',
  properties: {
    token: {
      type: 'string',
      description: 'JWT para el encabezado `Authorization: Bearer <token>`.',
    },
    usuario: { $ref: '#/components/schemas/UsuarioDTO' },
  },
  required: ['token', 'usuario'],
}

const producto = {
  type: 'object',
  description: 'Producto del inventario.',
  properties: {
    id: { type: 'integer', example: 1 },
    nombre: { type: 'string', example: 'Teclado mecánico' },
    descripcion: { type: 'string', example: 'Teclado retroiluminado de 87 teclas' },
    precio: { type: 'number', format: 'double', example: 189900 },
    stock: { type: 'integer', example: 25 },
    activo: { type: 'boolean', example: true },
  },
  required: ['id', 'nombre', 'descripcion', 'precio', 'stock', 'activo'],
}

const ticket = {
  type: 'object',
  description: [
    'Solicitud de salida de inventario sobre un producto.',
    '',
    'Ciclo de vida del ticket:',
    '',
    '- `PENDIENTE` puede aprobarse o cancelarse.',
    '- `APROBADO` puede entregarse o cancelarse.',
    '- `CANCELADO` y `ENTREGADO` son estados finales.',
    '',
    'Los casos de uso `AprobarTicket` y `CancelarTicket` validan estas transiciones antes de guardar el nuevo estado.',
  ].join('\n'),
  properties: {
    id: { type: 'integer', example: 1 },
    titulo: { type: 'string', example: 'Teclado para sala de juntas' },
    descripcion: { type: 'string', example: 'Reemplazo del equipo dañado' },
    estado: {
      type: 'string',
      enum: ESTADOS_TICKET,
      example: 'PENDIENTE',
      description: [
        'Estado actual del ticket.',
        '',
        'Transiciones permitidas:',
        '- `PENDIENTE` → `APROBADO` o `CANCELADO`.',
        '- `APROBADO` → `ENTREGADO` o `CANCELADO`.',
        '- `CANCELADO` y `ENTREGADO` no admiten más transiciones.',
      ].join('\n'),
    },
    productoId: { type: 'integer', example: 1 },
    cantidad: { type: 'integer', minimum: 1, example: 2 },
    fechaCreacion: { type: 'string', format: 'date-time' },
  },
  required: [
    'id',
    'titulo',
    'descripcion',
    'estado',
    'productoId',
    'cantidad',
    'fechaCreacion',
  ],
}

const saldoProducto = {
  type: 'object',
  description:
    'Saldo de inventario de un producto (`SaldoProducto`): la suma de sus entradas menos sus salidas.',
  properties: {
    productoId: { type: 'integer', example: 1 },
    nombre: { type: 'string', example: 'Teclado mecánico' },
    saldo: { type: 'integer', example: 25 },
  },
  required: ['productoId', 'nombre', 'saldo'],
}
const idUsuario = { name: 'id', in: 'path', required: true, description: 'Id del usuario.', schema: { type: 'integer', minimum: 1, example: 2 } }

const error = {
  type: 'object',
  properties: { error: { type: 'string', example: 'Correo o clave incorrectos' } },
  required: ['error'],
}

const respuestaError = (description: string, ejemplo: string) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorDTO' },
      example: { error: ejemplo },
    },
  },
})

const idTicket = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id del ticket.',
  schema: { type: 'integer', minimum: 1, example: 1 },
}

const respuestaTicket = (description: string) => ({
  description,
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/TicketDTO' } },
  },
})

const idInvalido = respuestaError(
  'El id no es un entero positivo.',
  'id inválido',
)

const ticketNoEncontrado = respuestaError(
  'No existe un ticket con ese id.',
  'No existe el ticket 42',
)

// Respuestas de las rutas protegidas por `exigirSesion` y `exigirRol`.
const sinSesion = respuestaError(
  'Token ausente, mal formado, expirado o con firma inválida.',
  'Sesión requerida',
)

const sinPermiso = (roles: string) =>
  respuestaError(
    `El token es válido pero el rol no está permitido. Requiere: ${roles}.`,
    `Esta acción requiere el rol ${roles}`,
  )

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'TktInventorySolution · API',
    version: '1.0.0',
    description: [
      'API del sistema de inventario y tickets.',
      '',
      'Cubre la **autenticación y el registro de usuarios**, el **catálogo de productos**, la',
      'gestión de **tickets** de salida de inventario (creación, consulta, aprobación y cancelación)',
      'y la consulta del **saldo de inventario**.',
      '',
      '**Cómo probar desde aquí**: registra un usuario en `POST /api/auth/registro`, inicia sesión en',
      '`POST /api/auth/login`, copia el `token` de la respuesta y pégalo en el botón **Authorize** de',
      'arriba. A partir de ahí las rutas protegidas responden.',
      '',
      '**Roles**: algunas rutas, además del token, exigen un rol concreto (`SOLICITANTE`,',
      '`ALMACENISTA` o `ADMINISTRADOR`); cada una lo indica en su descripción. Sin token responden',
      '**401**; con un token cuyo rol no está permitido responden **403**.',
      '',
      'Todas las rutas cuelgan del prefijo `/api`.',
    ].join('\n'),
    license: { name: 'MIT' },
  },
  servers: [{ url: '/api', description: 'Servidor actual' }],
  // Por defecto las rutas son públicas; solo las que declaran `security` exigen token.
  security: [],
  tags: [
    { name: 'Salud', description: 'Verificación de que el servicio responde.' },
    {
      name: 'Autenticación',
      description: 'Registro de usuarios, inicio de sesión y consulta del perfil propio.',
    },
    { name: 'Usuarios', description: 'Administración de los usuarios registrados.' },
    { name: 'Productos', description: 'Catálogo de productos del inventario.' },
    {
      name: 'Tickets',
      description: [
        'Solicitudes de salida de inventario.',
        '',
        'Estados y transiciones de negocio:',
        '',
        '| Estado actual | Transiciones permitidas |',
        '| --- | --- |',
        '| `PENDIENTE` | `APROBADO`, `CANCELADO` |',
        '| `APROBADO` | `ENTREGADO`, `CANCELADO` |',
        '| `CANCELADO` | Ninguna |',
        '| `ENTREGADO` | Ninguna |',
        '',
        'La aprobación y cancelación comprueban estas reglas y rechazan tanto tickets inexistentes como transiciones inválidas.',
      ].join('\n'),
    },
    {
      name: 'Inventario',
      description: 'Saldo de inventario calculado a partir de los movimientos de entrada y salida.',
    },
  ],
  paths: {
    '/salud': {
      get: {
        tags: ['Salud'],
        summary: 'Verificar que el servicio está vivo',
        description:
          'Responde 200 si el proceso atiende peticiones. No consulta SQL Server: sirve para el ' +
          'monitoreo, no para diagnosticar la persistencia.',
        responses: {
          200: {
            description: 'El servicio responde.',
            content: { 'application/json': { example: { estado: 'ok' } } },
          },
        },
      },
    },

    '/auth/registro': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar un usuario',
        description: [
          'Crea un usuario y devuelve sus datos públicos. **No inicia sesión**: para obtener un token',
          'hay que llamar después a `/auth/login`.',
          '',
          'Reglas que aplica el caso de uso `RegistrarUsuario`:',
          '',
          '- El correo se normaliza a minúsculas y sin espacios, de modo que `ANA@empresa.com` y',
          '  `ana@empresa.com` son el mismo usuario.',
          '- El correo es único; un segundo registro con el mismo correo responde 409.',
          '- La clave nunca se almacena en claro: se cifra con bcrypt antes de llegar al repositorio.',
          '- `rol` es opcional y por defecto es `SOLICITANTE`.',
        ].join('\n'),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: {
                    type: 'string',
                    minLength: 2,
                    description: 'Nombre completo.',
                    example: 'Ana Almacenista',
                  },
                  correo: {
                    type: 'string',
                    format: 'email',
                    description: 'Se normaliza a minúsculas.',
                    example: 'ana@empresa.com',
                  },
                  clave: {
                    type: 'string',
                    minLength: 8,
                    format: 'password',
                    example: 'clave-segura',
                  },
                  rol: {
                    type: 'string',
                    enum: ROLES,
                    default: 'SOLICITANTE',
                    description:
                      'SOLICITANTE pide productos; ALMACENISTA aprueba y entrega; ADMINISTRADOR configura.',
                    example: 'ALMACENISTA',
                  },
                },
                required: ['nombre', 'correo', 'clave'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario creado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UsuarioDTO' } },
            },
          },
          400: respuestaError(
            'Datos inválidos: nombre de menos de 2 caracteres, correo mal formado, clave de menos de 8 caracteres o rol desconocido.',
            'clave requerida (mínimo 8 caracteres)',
          ),
          409: respuestaError(
            'Ya existe un usuario con ese correo.',
            'El correo ana@empresa.com ya está registrado',
          ),
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        description: [
          'Valida las credenciales y devuelve un **JWT firmado (HS256, vigencia 8 horas)** que lleva',
          'el id del usuario en `sub` y su rol en `rol`. Ese token autoriza las rutas protegidas.',
          '',
          'Los tres casos de fallo —correo inexistente, usuario inactivo y clave incorrecta— responden',
          'el **mismo 401 con el mismo mensaje**, a propósito: distinguirlos permitiría averiguar qué',
          'correos están registrados en el sistema.',
        ].join('\n'),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  correo: { type: 'string', format: 'email', example: 'ana@empresa.com' },
                  clave: { type: 'string', format: 'password', example: 'clave-segura' },
                },
                required: ['correo', 'clave'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sesión iniciada.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SesionDTO' } },
            },
          },
          400: respuestaError(
            'Falta `correo` o `clave` en el cuerpo.',
            'correo y clave son obligatorios',
          ),
          401: respuestaError(
            'Credenciales inválidas o usuario inactivo.',
            'Correo o clave incorrectos',
          ),
        },
      },
    },

    '/auth/perfil': {
      get: {
        tags: ['Autenticación'],
        summary: 'Consultar el usuario de la sesión actual',
        description: [
          'Devuelve el usuario dueño del token enviado. La aplicación cliente la usa al arrancar para',
          'saber quién está en sesión y **qué rol tiene**.',
          '',
          'Los datos se releen de la base de datos en cada llamada, no se toman del token: si a un',
          'usuario le cambian el rol o lo desactivan, esta respuesta lo refleja sin esperar a que el',
          'token expire.',
        ].join('\n'),
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Usuario en sesión.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UsuarioDTO' } },
            },
          },
          401: respuestaError(
            'Token ausente, mal formado, expirado o con firma inválida.',
            'Sesión requerida',
          ),
          404: respuestaError(
            'El token es válido pero el usuario ya no existe.',
            'Usuario no encontrado',
          ),
        },
      },
    },

    '/usuarios/{id}': {
      put: {
        tags: ['Usuarios'], summary: 'Actualizar un usuario',
        description: 'Actualización parcial: cada usuario puede cambiar sus datos básicos; solo ADMINISTRADOR puede modificar a otros o cambiar rol y activo. El rol se relee de la base de datos.',
        security: [{ bearerAuth: [] }], parameters: [idUsuario],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', minProperties: 1, properties: {
            nombre: { type: 'string', minLength: 2 }, correo: { type: 'string', format: 'email' },
            clave: { type: 'string', minLength: 8, format: 'password' }, rol: { type: 'string', enum: ROLES }, activo: { type: 'boolean' },
          },
        } } } },
        responses: {
          200: { description: 'Usuario actualizado (sin el hash de la clave).', content: { 'application/json': { schema: { $ref: '#/components/schemas/UsuarioDTO' } } } },
          400: respuestaError('id o datos inválidos, o cuerpo sin campos.', 'id inválido'),
          401: respuestaError('Token ausente, mal formado, expirado o con firma inválida.', 'Sesión requerida'),
          403: respuestaError('El solicitante no tiene permiso para este cambio.', 'Acceso denegado'),
          404: respuestaError('No existe el usuario solicitado.', 'No existe el usuario 42'),
          409: respuestaError('El correo ya pertenece a otro usuario.', 'El correo ya está registrado'),
        },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar un usuario',
        description: 'Elimina definitivamente usuarios. Solo ADMINISTRADOR puede hacerlo. El rol se consulta en la base de datos y el administrador no puede eliminarse a si mismo. Para desactivar temporalmente use PUT con activo=false.',
        security: [{ bearerAuth: [] }],
        parameters: [idUsuario],
        responses: {
          204: { description: 'Usuario eliminado. Sin cuerpo.' },
          400: respuestaError('El id no es un entero positivo.', 'id invalido'),
          401: respuestaError('Token ausente, mal formado, expirado o con firma invalida.', 'Sesion requerida'),
          403: respuestaError('No es administrador o intenta eliminarse a si mismo.', 'Solo un administrador puede eliminar usuarios'),
          404: respuestaError('No existe un usuario con ese id.', 'No existe el usuario 42'),
        },
      },
    },

    '/productos': {
      get: {
        tags: ['Productos'],
        summary: 'Consultar todos los productos',
        responses: {
          200: {
            description: 'Catálogo completo, ordenado por id.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/ProductoDTO' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Productos'],
        summary: 'Registrar un producto',
        description:
          'Aplica las reglas de `CrearProducto`: el nombre no puede quedar vacío y ni el precio ni ' +
          'el stock pueden ser negativos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Teclado mecánico' },
                  descripcion: { type: 'string', default: '', example: 'Retroiluminado, 87 teclas' },
                  precio: { type: 'number', minimum: 0, example: 189900 },
                  stock: { type: 'integer', minimum: 0, example: 25 },
                  activo: { type: 'boolean', default: true },
                },
                required: ['nombre', 'precio', 'stock'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Producto creado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ProductoDTO' } },
            },
          },
          400: respuestaError(
            'Nombre vacío, precio negativo o stock negativo.',
            'El nombre del producto es obligatorio',
          ),
        },
      },
    },

    '/productos/{id}': {
      put: {
        tags: ['Productos'],
        summary: 'Actualizar un producto',
        description: [
          'Actualiza parcialmente el producto indicado. Solo se modifican los campos enviados; el id no cambia.',
          '',
          '- `nombre`, si se envía, no puede quedar vacío y se guarda sin espacios al inicio ni al final.',
          '- `descripcion` se guarda sin espacios al inicio ni al final.',
          '- `precio` debe ser mayor o igual a cero.',
          '- `stock` debe ser un entero mayor o igual a cero.',
          '- Debe enviarse al menos un campo modificable.',
        ].join('\n'),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  nombre: { type: 'string', minLength: 1, example: 'Teclado mecánico' },
                  descripcion: { type: 'string', example: 'Retroiluminado, 87 teclas' },
                  precio: { type: 'number', minimum: 0, example: 189900 },
                  stock: { type: 'integer', minimum: 0, example: 25 },
                  activo: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Producto actualizado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ProductoDTO' } },
            },
          },
          400: respuestaError(
            'id inválido, cuerpo sin campos o nombre, precio o stock no cumplen las reglas.',
            'El precio no puede ser negativo',
          ),
          404: respuestaError(
            'No existe un producto con el id indicado.',
            'No existe el producto 42',
          ),
        },
      },
      delete: {
        tags: ['Productos'],
        summary: 'Eliminar un producto',
        description: [
          'Borra definitivamente el producto con las reglas de `EliminarProducto`.',
          '',
          '**Requiere rol `ADMINISTRADOR`.**',
          '',
          '- Solo se elimina un producto que **no tenga tickets ni movimientos de inventario**: su',
          '  historia debe conservarse. Si los tiene, responde 409.',
          '- Para sacar del catálogo un producto con historia, usar `PUT /productos/{id}` con',
          '  `{ "activo": false }`.',
        ].join('\n'),
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Id del producto.',
            schema: { type: 'integer', minimum: 1, example: 1 },
          },
        ],
        responses: {
          204: { description: 'Producto eliminado. La respuesta no tiene cuerpo.' },
          400: respuestaError('El id no es un entero positivo.', 'id inválido'),
          401: sinSesion,
          403: sinPermiso('ADMINISTRADOR'),
          404: respuestaError('No existe un producto con ese id.', 'No existe el producto 42'),
          409: respuestaError(
            'El producto tiene tickets o movimientos de inventario que lo referencian.',
            'El producto 1 tiene 2 ticket(s) y 0 movimiento(s) de inventario; desactívalo en vez de eliminarlo',
          ),
        },
      },
    },

    '/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Consultar todos los tickets',
        description:
          'Devuelve el estado actual de cada solicitud. Consulta la descripción de `TicketDTO` para conocer el ciclo de vida y las transiciones permitidas.',
        responses: {
          200: {
            description: 'Tickets registrados, ordenados por id.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/TicketDTO' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Crear un ticket',
        description: [
          'Aplica las reglas de `CrearTicket`:',
          '',
          '- El título no puede quedar vacío.',
          '- La cantidad debe ser mayor que cero.',
          '- El producto referenciado debe existir.',
          '- El stock disponible debe alcanzar para la cantidad pedida.',
        ].join('\n'),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  titulo: { type: 'string', example: 'Teclado para sala de juntas' },
                  descripcion: {
                    type: 'string',
                    default: '',
                    example: 'Reemplazo del equipo dañado',
                  },
                  estado: { type: 'string', enum: ESTADOS_TICKET, default: 'PENDIENTE' },
                  productoId: { type: 'integer', example: 1 },
                  cantidad: { type: 'integer', minimum: 1, example: 2 },
                },
                required: ['titulo', 'productoId', 'cantidad'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Ticket creado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TicketDTO' } },
            },
          },
          400: respuestaError(
            'Título vacío, cantidad no positiva o estado desconocido.',
            'La cantidad debe ser mayor que cero',
          ),
          404: respuestaError(
            'El producto referenciado no existe.',
            'No existe el producto 42',
          ),
          409: respuestaError(
            'El producto no tiene stock suficiente para la cantidad pedida.',
            'Se solicitaron 10 unidades y solo hay 3',
          ),
        },
      },
    },

    '/tickets/{id}': {
      get: {
        tags: ['Tickets'],
        summary: 'Consultar un ticket por id',
        parameters: [idTicket],
        responses: {
          200: respuestaTicket('Ticket encontrado.'),
          400: idInvalido,
          404: ticketNoEncontrado,
        },
      },
      put: {
        tags: ['Tickets'],
        summary: 'Editar un ticket',
        description: [
          'Aplica cambios **parciales**: solo se modifican los campos enviados.',
          '',
          '- Solo se puede editar un ticket en estado `PENDIENTE`.',
          '- El `estado` no se edita aquí; se cambia con las rutas de ciclo de vida.',
          '- El título no puede quedar vacío y la cantidad debe ser un entero mayor que cero.',
          '- Si cambia el producto o la cantidad, el producto debe existir y tener stock suficiente.',
          '- Debe enviarse al menos un campo editable.',
        ].join('\n'),
        parameters: [idTicket],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  titulo: {
                    type: 'string',
                    example: 'Teclado para sala de juntas (urgente)',
                  },
                  descripcion: {
                    type: 'string',
                    example: 'Reemplazo del equipo dañado',
                  },
                  productoId: { type: 'integer', minimum: 1, example: 1 },
                  cantidad: { type: 'integer', minimum: 1, example: 3 },
                },
              },
            },
          },
        },
        responses: {
          200: respuestaTicket('Ticket editado.'),
          400: respuestaError(
            'id inválido, cuerpo sin campos, campo inválido o se intentó cambiar el estado.',
            'La cantidad debe ser un entero mayor que cero',
          ),
          404: respuestaError(
            'No existe el ticket, o no existe el producto indicado.',
            'No existe el ticket 42',
          ),
          409: respuestaError(
            'El ticket no está PENDIENTE, o el producto no tiene stock suficiente.',
            'Un ticket en estado APROBADO ya no se puede editar; solo los PENDIENTE',
          ),
        },
      },
    },

    '/tickets/{id}/aprobar': {
      patch: {
        tags: ['Tickets'],
        summary: 'Aprobar un ticket',
        description: [
          'Pasa el ticket a `APROBADO`. Aplica las reglas de `AprobarTicket`:',
          '',
          '- Solo un ticket en estado `PENDIENTE` puede aprobarse.',
          '- Desde cualquier otro estado la transición se rechaza con 409.',
        ].join('\n'),
        parameters: [idTicket],
        responses: {
          200: respuestaTicket('Ticket aprobado.'),
          400: idInvalido,
          404: ticketNoEncontrado,
          409: respuestaError(
            'El estado actual del ticket no permite pasar a APROBADO.',
            'Un ticket en estado CANCELADO no puede pasar a APROBADO',
          ),
        },
      },
    },

    '/tickets/{id}/cancelar': {
      patch: {
        tags: ['Tickets'],
        summary: 'Cancelar un ticket',
        description: [
          'Pasa el ticket a `CANCELADO`. Aplica las reglas de `CancelarTicket`:',
          '',
          '- Se puede cancelar mientras esté `PENDIENTE` o `APROBADO`.',
          '- Un ticket `ENTREGADO` ya no se cancela, porque el producto salió del inventario.',
          '- `CANCELADO` es un estado final.',
        ].join('\n'),
        parameters: [idTicket],
        responses: {
          200: respuestaTicket('Ticket cancelado.'),
          400: idInvalido,
          404: ticketNoEncontrado,
          409: respuestaError(
            'El estado actual del ticket no permite pasar a CANCELADO.',
            'Un ticket en estado ENTREGADO no puede pasar a CANCELADO',
          ),
        },
      },
    },

    '/inventario': {
      get: {
        tags: ['Inventario'],
        summary: 'Consultar el saldo de todos los productos',
        description:
          'El saldo de cada producto es la suma de sus ENTRADAS menos sus SALIDAS. Los productos ' +
          'sin movimientos aparecen con saldo 0.',
        responses: {
          200: {
            description: 'Saldo por producto, en el orden del catálogo.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SaldoProductoDTO' },
                },
              },
            },
          },
        },
      },
    },

    '/inventario/{productoId}': {
      get: {
        tags: ['Inventario'],
        summary: 'Consultar el saldo de un producto',
        parameters: [
          {
            name: 'productoId',
            in: 'path',
            required: true,
            description: 'Id del producto.',
            schema: { type: 'integer', minimum: 1, example: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Saldo del producto.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SaldoProductoDTO' },
              },
            },
          },
          400: respuestaError(
            'El productoId no es un entero positivo.',
            'productoId inválido',
          ),
          404: respuestaError(
            'No existe un producto con ese id.',
            'No existe el producto 42',
          ),
        },
      },
    },
  },
  components: {
    schemas: {
      UsuarioDTO: usuario,
      SesionDTO: sesion,
      ProductoDTO: producto,
      TicketDTO: ticket,
      ErrorDTO: error,
      SaldoProductoDTO: saldoProducto,
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Token obtenido en `POST /api/auth/login`. Lleva el rol del usuario, que usan las rutas ' +
          'restringidas por rol.',
      },
    },
  },
}
