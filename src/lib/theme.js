import { useEffect, useState } from "react";

/* ============================================================
   Claro / oscuro.

   Tres estados: "claro", "oscuro" y "auto" (sigue al teléfono,
   que de noche se pone oscuro solo). La elección se guarda en el
   dispositivo, así que cada uno puede tener la app de un color
   distinto sin pisarse.
   ============================================================ */

const KEY = "entrenamos:tema";
export const MODOS = ["auto", "claro", "oscuro"];

const prefiereOscuro = () =>
  globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;

export const resolver = (modo) =>
  modo === "auto" ? (prefiereOscuro() ? "dark" : "light") : modo === "claro" ? "light" : "dark";

function leer() {
  try {
    const v = localStorage.getItem(KEY);
    return MODOS.includes(v) ? v : "auto";
  } catch {
    return "auto";
  }
}

/* Se aplica al <html>, no al <body>: así el color de fondo cubre
   también el rebote al hacer scroll en iOS. */
function aplicar(modo) {
  const tema = resolver(modo);
  const el = document.documentElement;
  el.setAttribute("data-theme", tema);

  /* La barra de estado del teléfono se pinta del mismo color. */
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", tema === "dark" ? "#0B0F14" : "#F1F4FA");
  return tema;
}

/* Se llama en index.html antes de pintar, para que no haya un
   destello blanco al abrir la app en modo oscuro. */
export function aplicarTemaInicial() {
  aplicar(leer());
}

export function useTema() {
  const [modo, setModo] = useState(leer);

  useEffect(() => {
    aplicar(modo);
    try {
      localStorage.setItem(KEY, modo);
    } catch {
      /* Modo privado: el tema dura lo que dure la sesión. */
    }
  }, [modo]);

  /* En "auto", seguir al sistema si cambia mientras la app está abierta. */
  useEffect(() => {
    if (modo !== "auto") return;
    const mq = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = () => aplicar("auto");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [modo]);

  return [modo, setModo, resolver(modo)];
}

/* El carril activo también vive en el <html>, para que el CSS pueda
   usar var(--accent) sin que cada componente lo pase a mano. */
export function useCarril(program) {
  useEffect(() => {
    document.documentElement.setAttribute("data-lane", program || "ignacio");
  }, [program]);
}
