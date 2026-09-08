import "dotenv/config";

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }

  return value;
}

function booleanValue(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]?.trim();
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
}

function portValue(name: string, defaultValue: number): number {
  const value = process.env[name]?.trim();
  if (!value) return defaultValue;

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} debe ser un puerto válido.`);
  }

  return port;
}

export const entorno = {
  puertoHttp: portValue("PORT", 3000),
  sqlServer: {
    servidor: required("DB_SERVER"),
    puerto: portValue("DB_PORT", 1433),
    baseDeDatos: required("DB_DATABASE"),
    tipoAutenticacion: process.env.DB_AUTH_TYPE?.trim().toLowerCase() ?? "windows",
    encrypt: booleanValue("DB_ENCRYPT", true),
    trustServerCertificate: booleanValue("DB_TRUST_SERVER_CERTIFICATE", true),
  },
};
