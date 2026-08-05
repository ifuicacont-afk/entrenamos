/* ============================================================
   Puente entre el CSS y los componentes.

   Cada valor apunta a una variable CSS definida en index.css.
   Los componentes siguen escribiendo style={{ color: C.text }}
   como antes, pero ahora el valor real lo decide el tema activo.
   Cambiar de claro a oscuro no vuelve a renderizar nada: el
   navegador repinta solo.
   ============================================================ */

export const C = {
  bg: "var(--bg)",
  bgDeep: "var(--bg-deep)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  surface3: "var(--surface-3)",
  border: "var(--border)",
  borderSoft: "var(--border-soft)",

  text: "var(--text)",
  muted: "var(--text-muted)",
  faint: "var(--text-faint)",

  done: "var(--ok)",
  warn: "var(--warn)",
  danger: "var(--danger)",

  brand: "var(--brand)",
  brandSoft: "var(--brand-soft)",

  card: "var(--card)",
  cardRaised: "var(--card-raised)",
  ringTrack: "var(--ring-track)",
  hairline: "var(--hairline)",
};

export const SHADOW = {
  sm: "var(--shadow-sm)",
  md: "var(--shadow)",
  lg: "var(--shadow-lg)",
};

/* Cada persona tiñe la interfaz con su propio color. Se exponen los
   dos carriles a la vez porque la pantalla de registro los muestra
   lado a lado para elegir. */
export const LANES = {
  ignacio: {
    accent: "var(--lane-ignacio)",
    soft: "var(--lane-ignacio-soft)",
    glow: "var(--lane-ignacio-glow)",
    label: "Plan Ignacio",
    detalle: "4 días · Speediance",
  },
  linda: {
    accent: "var(--lane-linda)",
    soft: "var(--lane-linda-soft)",
    glow: "var(--lane-linda-glow)",
    label: "Plan Linda",
    detalle: "5 días · plan de su entrenadora",
  },
};

/* El orden en que se ofrecen al registrarse. El de Linda va primero. */
export const ORDEN_CARRILES = ["linda", "ignacio"];

/* ---------- colores a elección ----------

   Cada color trae dos versiones. Los tonos que lucen bien sobre
   fondo oscuro son demasiado claros sobre blanco: se pierden y
   cansan la vista. Por eso el tema claro usa una variante más
   profunda del mismo color, no el mismo valor.

   El primero de la lista, "auto", respeta el color que trae el plan
   de cada uno: naranjo para Ignacio, turquesa para Linda. */
export const COLORES = [
  { id: "auto",     nombre: "Del plan" },
  { id: "naranjo",  nombre: "Naranjo",  oscuro: "#FF7A45", claro: "#EA580C" },
  { id: "turquesa", nombre: "Turquesa", oscuro: "#3FD0C9", claro: "#0E9E96" },
  { id: "azul",     nombre: "Azul",     oscuro: "#60A5FA", claro: "#2563EB" },
  { id: "violeta",  nombre: "Violeta",  oscuro: "#A78BFA", claro: "#7C3AED" },
  { id: "fucsia",   nombre: "Fucsia",   oscuro: "#E879F9", claro: "#C026D3" },
  { id: "rosa",     nombre: "Rosa",     oscuro: "#FB7185", claro: "#E11D48" },
  { id: "verde",    nombre: "Verde",    oscuro: "#4ADE80", claro: "#15A34A" },
  { id: "ambar",    nombre: "Ámbar",    oscuro: "#FBBF24", claro: "#B45309" },
];

/* El carril que está en uso. Apunta a --accent, que es lo que cambia
   cuando alguien elige otro color. Los LANES de arriba mantienen su
   color fijo porque la pantalla de registro muestra los dos planes
   lado a lado y ahí el color identifica al plan, no a la persona. */
export const CARRIL_ACTIVO = {
  accent: "var(--accent)",
  soft: "var(--accent-soft)",
  glow: "var(--accent-glow)",
};

/* Degradado del bloque principal de cada pantalla. */
export const heroGradient = (lane) =>
  `linear-gradient(145deg, ${lane.accent} 0%, ${lane.accent} 45%, var(--brand) 140%)`;
