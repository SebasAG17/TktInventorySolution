-- Esquema de TktInventorySolution.
--
-- Ejecutar sobre la base de datos indicada en DB_DATABASE
-- antes de arrancar el servidor por primera vez.

IF OBJECT_ID('dbo.Producto', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Producto (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    nombre      NVARCHAR(200)  NOT NULL,
    descripcion NVARCHAR(1000) NOT NULL CONSTRAINT DF_Producto_descripcion DEFAULT '',
    precio      DECIMAL(18, 2) NOT NULL CONSTRAINT CK_Producto_precio CHECK (precio >= 0),
    stock       INT            NOT NULL CONSTRAINT CK_Producto_stock  CHECK (stock  >= 0),
    activo      BIT            NOT NULL CONSTRAINT DF_Producto_activo DEFAULT 1
  );
END
GO

IF OBJECT_ID('dbo.Ticket', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Ticket (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    titulo        NVARCHAR(200)  NOT NULL,
    descripcion   NVARCHAR(1000) NOT NULL CONSTRAINT DF_Ticket_descripcion DEFAULT '',
    estado        NVARCHAR(20)   NOT NULL CONSTRAINT DF_Ticket_estado DEFAULT 'PENDIENTE',
    productoId    INT            NOT NULL,
    cantidad      INT            NOT NULL CONSTRAINT CK_Ticket_cantidad CHECK (cantidad > 0),
    fechaCreacion DATETIME2      NOT NULL CONSTRAINT DF_Ticket_fecha DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Ticket_Producto FOREIGN KEY (productoId) REFERENCES dbo.Producto (id),
    -- Debe coincidir con ESTADOS_TICKET en src/dominio/modelo/EstadoTicket.ts
    CONSTRAINT CK_Ticket_estado CHECK (estado IN ('PENDIENTE', 'APROBADO', 'CANCELADO', 'ENTREGADO'))
  );
END
GO

IF OBJECT_ID('dbo.Usuario', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Usuario (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    nombre    NVARCHAR(200) NOT NULL,
    -- El correo se guarda siempre en minúsculas (lo normaliza RegistrarUsuario).
    correo    NVARCHAR(320) NOT NULL,
    -- Hash bcrypt: 60 caracteres, nunca la clave en claro.
    claveHash NVARCHAR(100) NOT NULL,
    rol       NVARCHAR(20)  NOT NULL CONSTRAINT DF_Usuario_rol    DEFAULT 'SOLICITANTE',
    activo    BIT           NOT NULL CONSTRAINT DF_Usuario_activo DEFAULT 1,

    CONSTRAINT UQ_Usuario_correo UNIQUE (correo),
    -- Debe coincidir con ROLES en src/dominio/modelo/Usuario.ts
    CONSTRAINT CK_Usuario_rol CHECK (rol IN ('SOLICITANTE', 'ALMACENISTA', 'ADMINISTRADOR'))
  );
END
GO
