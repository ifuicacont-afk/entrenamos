import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

/* ============================================================
   Prepara las ilustraciones de los ejercicios.

   Las imágenes se generan aparte (vienen en PNG de 2048x2048 y pesan
   varios MB cada una). Así como llegan harían que la app tardara una
   eternidad en abrir justo donde se usa: con datos móviles.

   Este script toma todo lo que haya en ORIGEN y lo deja listo:
     1. Cuadra a 512x512, que es más que suficiente para la tarjeta
        abierta en un teléfono.
     2. Exporta en WebP, unas 200 veces más liviano que el PNG.
     3. Lo escribe en src/assets/ejercicios, de donde Vite las toma.

   El nombre del archivo ES la conexión con el programa: tiene que ser
   programa-ejercicio (ignacio-banca.png, linda-sentcomb.png), con el
   mismo id que aparece en src/data/programs.js. El programa va en el
   nombre porque hay ids que existen en los dos planes — "crunch" es
   uno — y son movimientos distintos.

   Correr con: npm run ilustraciones
   ============================================================ */

const ORIGEN = "C:/Users/ignac/Downloads/ejercicios/";
const DESTINO = "src/assets/ejercicios/";
const LADO = 512;

const PROGRAMAS = ["ignacio", "linda"];

async function main() {
  await mkdir(DESTINO, { recursive: true });

  let archivos;
  try {
    archivos = (await readdir(ORIGEN)).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  } catch {
    console.error(`No existe la carpeta ${ORIGEN}.`);
    console.error("Deja ahí los PNG con el nombre programa-ejercicio.png y vuelve a correr.");
    process.exit(1);
  }

  if (!archivos.length) {
    console.log(`No hay imágenes en ${ORIGEN}.`);
    return;
  }

  let listas = 0;
  for (const archivo of archivos) {
    const nombre = path.basename(archivo, path.extname(archivo)).toLowerCase();

    /* Un nombre mal puesto dejaría la imagen invisible en la app sin
       ningún error: mejor avisar acá que buscarlo después. */
    if (!PROGRAMAS.some((p) => nombre.startsWith(p + "-"))) {
      console.warn(`  saltada: ${archivo} — el nombre debe empezar con ${PROGRAMAS.join("- o ")}-`);
      continue;
    }

    const { size } = await sharp(path.join(ORIGEN, archivo))
      .resize(LADO, LADO, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(path.join(DESTINO, nombre + ".webp"));

    console.log(`  ${nombre}.webp — ${Math.round(size / 1024)} KB`);
    listas++;
  }

  console.log(`\n${listas} ilustraciones listas en ${DESTINO}`);
}

main();
