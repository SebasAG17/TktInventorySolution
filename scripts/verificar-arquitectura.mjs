// Guardia de la arquitectura hexagonal.
//
// El dominio y la aplicación definen los puertos; solo la
// infraestructura los implementa. Si una de esas dos capas
// nombra a `infraestructura`, la dependencia va al revés y
// la regla está rota.
//
// Escrito en Node y no como un `grep` en el package.json
// para que funcione igual en Windows, macOS y Linux.

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const CAPAS_PROTEGIDAS = ['src/dominio', 'src/aplicacion']
const PROHIBIDO = 'infraestructura'

function archivosTs(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name)
    if (entrada.isDirectory()) return archivosTs(ruta)
    return entrada.name.endsWith('.ts') ? [ruta] : []
  })
}

const violaciones = CAPAS_PROTEGIDAS.flatMap((capa) =>
  archivosTs(capa).flatMap((archivo) =>
    readFileSync(archivo, 'utf8')
      .split(/\r?\n/)
      .map((linea, indice) => ({ linea, numero: indice + 1 }))
      .filter(({ linea }) => linea.includes(PROHIBIDO))
      .map(({ linea, numero }) => ({
        archivo: relative(process.cwd(), archivo),
        numero,
        linea: linea.trim(),
      })),
  ),
)

if (violaciones.length > 0) {
  console.error(
    `El dominio y la aplicación no pueden depender de la infraestructura.\n` +
      `Se encontraron ${violaciones.length} referencia(s):\n`,
  )

  for (const { archivo, numero, linea } of violaciones) {
    console.error(`  ${archivo}:${numero}  ${linea}`)
  }

  process.exit(1)
}

console.log('Arquitectura correcta: el dominio y la aplicación no conocen la infraestructura.')
