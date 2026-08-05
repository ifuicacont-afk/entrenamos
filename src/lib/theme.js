import { useEffect, useState } from "react";
import { COLORES } from "../data/theme";
import { supabase, isConfigured } from "./supabase";

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

/* ============================================================
   Color de la app.

   Se guarda en dos lugares a propósito:

   · En el dispositivo, para que al abrir la app el color esté
     puesto antes de dibujar nada. Si solo viviera en el servidor,
     cada apertura mostraría un parpadeo del color anterior.
   · En la cuenta (los datos del usuario en Supabase), para que al
     entrar desde otro teléfono siga siendo el mismo.

   Si falla lo segundo no pasa nada: el color igual quedó guardado
   en el dispositivo.
   ============================================================ */

const KEY_COLOR = "entrenamos:color";

const aRgba = (hex, alfa) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
};

/* Escribe el color elegido encima de lo que traiga el plan. Con
   "auto" se borra la marca y vuelve a mandar el color del plan. */
export function aplicarColor(id, tema) {
  const raiz = document.documentElement;
  const color = COLORES.find((c) => c.id === id);

  if (!color || id === "auto") {
    raiz.style.removeProperty("--accent");
    raiz.style.removeProperty("--accent-soft");
    raiz.style.removeProperty("--accent-glow");
    return;
  }

  const hex = tema === "light" ? color.claro : color.oscuro;
  raiz.style.setProperty("--accent", hex);
  raiz.style.setProperty("--accent-soft", aRgba(hex, tema === "light" ? 0.12 : 0.15));
  raiz.style.setProperty("--accent-glow", aRgba(hex, tema === "light" ? 0.28 : 0.32));
}

function leerColor() {
  try {
    const v = localStorage.getItem(KEY_COLOR);
    return COLORES.some((c) => c.id === v) ? v : "auto";
  } catch {
    return "auto";
  }
}

export function useColor(tema, sesion) {
  const [color, setColor] = useState(leerColor);

  /* Al entrar, lo que diga la cuenta manda sobre lo del dispositivo:
     es lo que sigue a la persona de un teléfono a otro. */
  useEffect(() => {
    const guardado = sesion?.user?.user_metadata?.color;
    if (guardado && COLORES.some((c) => c.id === guardado)) setColor(guardado);
  }, [sesion]);

  useEffect(() => {
    aplicarColor(color, tema);
    try {
      localStorage.setItem(KEY_COLOR, color);
    } catch {
      /* Modo privado: el color dura lo que dure la sesión. */
    }
  }, [color, tema]);

  const elegir = (id) => {
    setColor(id);
    if (isConfigured && sesion) {
      supabase.auth.updateUser({ data: { color: id } }).catch(() => {
        /* Sin señal: quedó en el dispositivo, se sincroniza al volver. */
      });
    }
  };

  return [color, elegir];
}
