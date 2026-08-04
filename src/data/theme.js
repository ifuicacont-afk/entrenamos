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

/* Degradado del bloque principal de cada pantalla. */
export const heroGradient = (lane) =>
  `linear-gradient(145deg, ${lane.accent} 0%, ${lane.accent} 45%, var(--brand) 140%)`;
