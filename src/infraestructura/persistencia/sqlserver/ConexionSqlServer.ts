import sql from "mssql/msnodesqlv8";
import { entorno } from "../../configuracion/entorno";

/**
 * mssql arma la cadena con "SQL Server Native Client 11.0" y siempre anexa el
 * puerto, lo que falla en equipos que solo tienen los ODBC Driver 17/18 o que
 * usan memoria compartida. Por eso la construimos a mano.
 */
function construirCadenaConexion(): string {
  const {
    servidor,
    puerto,
    baseDeDatos,
    driverOdbc,
    tipoAutenticacion,
    encrypt,
    trustServerCertificate,
  } = entorno.sqlServer;

  const partes = [
    `Driver={${driverOdbc}}`,
    `Server=${puerto !== undefined ? `${servidor},${puerto}` : servidor}`,
    `Database=${baseDeDatos}`,
    `Encrypt=${encrypt ? "Yes" : "No"}`,
    `TrustServerCertificate=${trustServerCertificate ? "Yes" : "No"}`,
  ];

  if (tipoAutenticacion === "windows") partes.push("Trusted_Connection=Yes");

  return `${partes.join(";")};`;
}

/**
 * @types/mssql no declara `connectionString` a nivel raíz, pero el driver
 * msnodesqlv8 sí la lee de ahí (y le da prioridad sobre el resto de la config).
 */
type ConfiguracionSqlServer = sql.config & { connectionString: string };

const configuracion: ConfiguracionSqlServer = {
  connectionString: construirCadenaConexion(),
  // Requerido por el tipo; se ignora porque manda la cadena de conexión.
  server: entorno.sqlServer.servidor,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30_000,
  },
};

/** Pool único de SQL Server compartido por todos los DAO/repositorios. */
export class ConexionSqlServer {
  private static pool: sql.ConnectionPool | undefined;
  private static conectando: Promise<sql.ConnectionPool> | undefined;

  static async obtenerPool(): Promise<sql.ConnectionPool> {
    if (this.pool?.connected) return this.pool;

    if (!this.conectando) {
      const nuevoPool = new sql.ConnectionPool(configuracion);
      this.conectando = nuevoPool.connect()
        .then((pool) => {
          this.pool = pool;
          return pool;
        })
        .catch((error: unknown) => {
          this.conectando = undefined;
          throw error;
        });
    }

    return this.conectando;
  }

  static async verificarConexion(): Promise<void> {
    const pool = await this.obtenerPool();
    await pool.request().query("SELECT 1 AS conectado");
  }

  static async cerrar(): Promise<void> {
    if (this.pool) await this.pool.close();
    this.pool = undefined;
    this.conectando = undefined;
  }
}

export { sql };
