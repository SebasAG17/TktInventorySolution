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
  description: 'Solicitud de salida de inventario sobre un producto.',
  properties: {
    id: { type: 'integer', example: 1 },
    titulo: { type: 'string', example: 'Teclado para sala de juntas' },
    descripcion: { type: 'string', example: 'Reemplazo del equipo dañado' },
    estado: { type: 'string', enum: ESTADOS_TICKET, example: 'PENDIENTE' },
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

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'TktInventorySolution · API',
    version: '1.0.0',
    description: [
      'API del sistema de inventario y tickets.',
      '',
      'Cubre la **autenticación y el registro de usuarios**, el **catálogo de productos** y la',
      'creación de **tickets** de salida de inventario.',
      '',
      '**Cómo probar desde aquí**: registra un usuario en `POST /api/auth/registro`, inicia sesión en',
      '`POST /api/auth/login`, copia el `token` de la respuesta y pégalo en el botón **Authorize** de',
      'arriba. A partir de ahí las rutas protegidas responden.',
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
    { name: 'Productos', description: 'Catálogo de productos del inventario.' },
    { name: 'Tickets', description: 'Solicitudes de salida de inventario.' },
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

    '/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Consultar todos los tickets',
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
            'Título vacío, cantidad no positiva, estado desconocido, producto inexistente o stock insuficiente.',
            'No hay suficiente stock del producto',
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
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token obtenido en `POST /api/auth/login`.',
      },
    },
  },
}
