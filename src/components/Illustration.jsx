import React from "react";

/* ============================================================
   ILUSTRACIONES

   Figuras planas y geométricas, hechas con círculos y trazos
   gruesos de punta redonda. Se leen como pictogramas, no como
   dibujos: envejecen bien, pesan nada y se tiñen solas con el
   color de cada persona.

   Todas usan el mismo lienzo de 120×120 y la misma mancha de
   fondo, así se ven como una familia y no como cinco dibujos
   sueltos.
   ============================================================ */

const trazo = {
  fill: "none",
  strokeWidth: 8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* Mancha orgánica de fondo. No es un círculo: le da movimiento. */
function Mancha({ color, opacity = 1 }) {
  return (
    <path
      opacity={opacity}
      fill={color}
      d="M97 44c7 16 3 38-11 49s-38 12-52 2S13 62 18 45 40 15 60 14s30 14 37 30Z"
    />
  );
}

function Lienzo({ size, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

/* Press de hombro: la figura del entrenamiento. */
export function Levanta({ size = 120, a = "var(--accent)", b = "var(--brand)" }) {
  return (
    <Lienzo size={size}>
      <Mancha color="var(--accent-soft)" />
      {/* barra y discos */}
      <rect x="28" y="20" width="64" height="6" rx="3" fill={b} />
      <rect x="22" y="12" width="8" height="22" rx="4" fill={b} />
      <rect x="90" y="12" width="8" height="22" rx="4" fill={b} />
      {/* brazos */}
      <path {...trazo} stroke={a} d="M51 60 44 29" />
      <path {...trazo} stroke={a} d="M69 60 76 29" />
      {/* cabeza y tronco */}
      <circle cx="60" cy="44" r="10" fill={a} />
      <rect x="50" y="56" width="20" height="28" rx="10" fill={a} />
      {/* piernas */}
      <path {...trazo} stroke={a} d="M55 84 52 106" />
      <path {...trazo} stroke={a} d="M65 84 68 106" />
    </Lienzo>
  );
}

/* Sentadilla de perfil: la figura del día de pierna. */
export function Sentadilla({ size = 120, a = "var(--accent)", b = "var(--brand)" }) {
  return (
    <Lienzo size={size}>
      <Mancha color="var(--accent-soft)" />
      <rect x="26" y="34" width="58" height="6" rx="3" fill={b} />
      <rect x="20" y="26" width="8" height="22" rx="4" fill={b} />
      <rect x="82" y="26" width="8" height="22" rx="4" fill={b} />
      <circle cx="62" cy="46" r="10" fill={a} />
      {/* tronco inclinado y piernas flectadas */}
      <path {...trazo} stroke={a} d="M60 58 54 76" />
      <path {...trazo} stroke={a} d="M54 76 72 82 68 104" />
      <path {...trazo} stroke={a} d="M54 76 44 92 48 104" />
    </Lienzo>
  );
}

/* Figura sentada: el día de descanso. */
export function Reposo({ size = 120, a = "var(--accent)", b = "var(--brand)" }) {
  return (
    <Lienzo size={size}>
      <Mancha color="var(--accent-soft)" />
      <circle cx="52" cy="42" r="10" fill={a} />
      <path {...trazo} stroke={a} d="M52 54 52 76" />
      <path {...trazo} stroke={a} d="M52 76 78 76" />
      <path {...trazo} stroke={a} d="M78 76 78 96" />
      <path {...trazo} stroke={a} d="M52 76 40 96" />
      {/* suelo */}
      <path {...trazo} stroke={b} strokeWidth="6" d="M30 104 92 104" opacity="0.45" />
      {/* zeta de descanso */}
      <path {...trazo} stroke={b} strokeWidth="5" d="M74 34 86 34 74 48 86 48" />
    </Lienzo>
  );
}

/* Plato servido: la pestaña de comida. */
export function Plato({ size = 120, a = "var(--accent)", b = "var(--brand)" }) {
  return (
    <Lienzo size={size}>
      <Mancha color="var(--accent-soft)" />
      <circle cx="60" cy="62" r="30" fill="none" stroke={a} strokeWidth="8" />
      <circle cx="60" cy="62" r="15" fill={b} opacity="0.85" />
      <path {...trazo} strokeWidth="6" stroke={a} d="M28 40 28 60" />
      <path {...trazo} strokeWidth="6" stroke={a} d="M92 40 92 60" />
    </Lienzo>
  );
}

/* Cima con bandera: las rachas y los logros. */
export function Cima({ size = 120, a = "var(--accent)", b = "var(--brand)" }) {
  return (
    <Lienzo size={size}>
      <Mancha color="var(--accent-soft)" />
      <path fill={a} d="M60 34 92 92H28l32-58Z" />
      <path fill={b} opacity="0.9" d="M60 34 74 60H46l14-26Z" />
      <path {...trazo} strokeWidth="5" stroke={b} d="M60 34 60 16" />
      <path fill={b} d="M60 16h18l-5 6 5 6H60z" />
    </Lienzo>
  );
}

/* Anillo suelto: estados vacíos, cuando todavía no hay datos. */
export function Vacio({ size = 120, a = "var(--accent)", b = "var(--brand)" }) {
  return (
    <Lienzo size={size}>
      <Mancha color="var(--accent-soft)" opacity={0.7} />
      <circle cx="60" cy="60" r="28" fill="none" stroke="var(--ring-track)" strokeWidth="9" />
      <circle
        cx="60" cy="60" r="28" fill="none" stroke={a} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${2 * Math.PI * 28 * 0.12} ${2 * Math.PI * 28}`}
        transform="rotate(-90 60 60)"
      />
      <circle cx="60" cy="60" r="6" fill={b} />
    </Lienzo>
  );
}

export default { Levanta, Sentadilla, Reposo, Plato, Cima, Vacio };
