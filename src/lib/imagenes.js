/* ============================================================
   ILUSTRACIONES DE LOS EJERCICIOS

   Viven en src/assets/ejercicios y se llaman programa-ejercicio.webp
   (ignacio-banca.webp, linda-sentcomb.webp). El nombre lleva el programa
   a propósito: hay ids que existen en los dos planes — "crunch" es uno —
   y son movimientos distintos. Indexar solo por ejercicio mostraría el
   dibujo equivocado.

   Vite las enumera al compilar, así que el mapa solo contiene las que de
   verdad están. Pedir una que falta devuelve null y la tarjeta muestra el
   hueco, nunca una imagen rota.
   ============================================================ */

const archivos = import.meta.glob("../assets/ejercicios/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const MAPA = Object.fromEntries(
  Object.entries(archivos).map(([ruta, url]) => [
    ruta.split("/").pop().replace(".webp", ""),
    url,
  ])
);

export const imagenEjercicio = (programa, id) => MAPA[`${programa}-${id}`] || null;

/* Cuántas hay listas, para poder avisarlo en el menú. */
export const cuantasImagenes = (programa) =>
  Object.keys(MAPA).filter((k) => k.startsWith(programa + "-")).length;
