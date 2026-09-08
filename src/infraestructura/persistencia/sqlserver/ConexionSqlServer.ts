import sql from "mssql/msnodesqlv8";
import { entorno } from "../../configuracion/entorno";

const configuracion: sql.config = {
  server: entorno.sqlServer.servidor,
  port: entorno.sqlServer.puerto,
  database: entorno.sqlServer.baseDeDatos,
  driver: "msnodesqlv8",
  options: {
    trustedConnection: entorno.sqlServer.tipoAutenticacion === "windows",
    encrypt: entorno.sqlServer.encrypt,
    trustServerCertificate: entorno.sqlServer.trustServerCertificate,
  },
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
