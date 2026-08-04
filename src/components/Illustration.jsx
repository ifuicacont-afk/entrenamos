import React from "react";

/* ============================================================
   ILUSTRACIONES

   Quedan solo las dos abstractas. Las figuras humanas que había acá
   antes las reemplazaron los personajes reales de Ignacio y Linda
   (ver Logo.jsx): teniendo el dibujo de cada uno, no tenía sentido
   mostrar un monito genérico.

   Estas dos siguen porque no representan a una persona sino una
   idea, y se tiñen solas con el color de quien esté usando la app.
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

/* Anillo a medio llenar: estados vacíos, cuando todavía no hay datos. */
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
