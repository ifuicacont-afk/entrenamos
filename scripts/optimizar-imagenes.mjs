import sharp from "sharp";
import { mkdir } from "node:fs/promises";

/* ============================================================
   Prepara el logo y los personajes para la web.

   Los originales vienen de 1024x1536 y pesan 2 a 3 MB cada uno.
   Así como están harían que la app tardara una eternidad en abrir
   con datos móviles, que es justo donde se va a usar.

   Este script:
     1. Recorta el aire transparente que rodea al dibujo.
     2. Genera cada tamaño que la app necesita, ni uno más.
     3. Exporta en WebP, que pesa unas 10 veces menos que el PNG
        y mantiene la transparencia.
     4. Arma los íconos de la app desde el emblema.

   Correr con: npm run imagenes
   ============================================================ */

const ORIGEN = "C:/Users/ignac/Downloads/";
const DESTINO = "public/marca/";
const ICONOS = "public/";

/* El borde de estos dibujos tiene píxeles casi transparentes que
   confunden al recorte automático. Se busca a mano el rectángulo que
   contiene el dibujo de verdad, ignorando todo lo que esté por debajo
   de este umbral de opacidad. */
const UMBRAL_ALFA = 20;

async function recuadroDelDibujo(ruta) {
  const { data, info } = await sharp(ruta).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let x0 = w, y0 = h, x1 = 0, y1 = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * c + 3] > UMBRAL_ALFA) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < x0 || y1 < y0) return { left: 0, top: 0, width: w, height: h };
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

const recortado = async (ruta) => sharp(ruta).extract(await recuadroDelDibujo(ruta));

/* Cuadrado tomado desde arriba: en los personajes captura la cabeza y
   los hombros, que es lo que sirve como foto de perfil. */
async function cuadradoSuperior(ruta, lado) {
  const r = await recuadroDelDibujo(ruta);
  const lente = Math.min(r.width, Math.round(r.height * 0.42));
  return sharp(ruta).extract({
    left: r.left + Math.round((r.width - lente) / 2),
    top: r.top,
    width: lente,
    height: lente,
  }).resize(lado, lado);
}

async function main() {
  await mkdir(DESTINO, { recursive: true });
  const hechos = [];
  const anotar = async (nombre, pipeline) => {
    const info = await pipeline.toFile(nombre);
    hechos.push(`${nombre.padEnd(34)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ${(info.size / 1024).toFixed(0).padStart(5)} KB`);
  };

  const logo = ORIGEN + "Logo app Entrenamos.png";

  /* ---- emblema: solo la pareja, sin el texto ----
     No se genera el logo completo a propósito: su texto "ENTRENAMOS"
     es azul muy oscuro y desaparecería en tema oscuro. La app escribe
     el nombre con su propia tipografía, que sí cambia de color. */
  const rl = await recuadroDelDibujo(logo);
  const soloPareja = () => sharp(logo).extract({
    left: rl.left, top: rl.top, width: rl.width, height: Math.round(rl.height * 0.66),
  });
  await anotar(DESTINO + "emblema.webp", soloPareja().resize({ width: 420 }).webp({ quality: 90 }));

  /* ---- personajes ---- */
  for (const [quien, archivo] of [["linda", "Personaje Linda.png"], ["ignacio", "Personaje Ignacio.png"]]) {
    await anotar(DESTINO + `${quien}.webp`,
      (await recortado(ORIGEN + archivo)).resize({ height: 620 }).webp({ quality: 86 }));
    await anotar(DESTINO + `${quien}-cara.webp`,
      (await cuadradoSuperior(ORIGEN + archivo, 200)).webp({ quality: 90 }));
  }

  /* ---- íconos de la app ----
     Van sobre fondo claro y con aire alrededor: iOS no respeta la
     transparencia (la pinta de negro) y Android recorta los bordes
     para hacer el ícono redondo. */
  const emblemaBuf = await soloPareja().resize({ width: 760, fit: "inside" }).png().toBuffer();
  const conFondo = async (lado, margen) => {
    const dibujo = await sharp(emblemaBuf)
      .resize({ width: lado - margen * 2, height: lado - margen * 2, fit: "inside" })
      .png()
      .toBuffer();
    return sharp({ create: { width: lado, height: lado, channels: 4, background: "#F1F4FA" } })
      .composite([{ input: dibujo, gravity: "center" }])
      .png();
  };

  await anotar(ICONOS + "icon-192.png", await conFondo(192, 16));
  await anotar(ICONOS + "icon-512.png", await conFondo(512, 44));
  await anotar(ICONOS + "apple-touch-icon.png", await conFondo(180, 14));

  console.log("\n  " + hechos.join("\n  ") + "\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
