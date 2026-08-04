import React from "react";

/* ============================================================
   MARCA

   El logo real de Ignacio y Linda. Una decisión de diseño acá:
   el archivo original trae el nombre "ENTRENAMOS" dibujado abajo,
   en azul muy oscuro. Sobre fondo claro se ve bien, pero en tema
   oscuro desaparecería.

   Por eso se usa solo el emblema (los dos personajes, sin texto) y
   el nombre se escribe con la tipografía de la app, que sí cambia
   de color con el tema. Se ve igual de bien en claro y en oscuro,
   y de paso el archivo pesa menos.
   ============================================================ */

const EMBLEMA = "/marca/emblema.webp";

/* Proporción real del emblema (420x297), para que el navegador
   reserve el espacio antes de cargarlo y la pantalla no salte. */
const RATIO = 420 / 297;

export function Isotipo({ size = 40, className = "" }) {
  return (
    <img
      src={EMBLEMA}
      alt=""
      aria-hidden="true"
      width={Math.round(size * RATIO)}
      height={size}
      className={className}
      style={{ height: size, width: "auto", display: "block" }}
    />
  );
}

/* Marca completa: emblema + nombre. */
export function Logo({ size = 34, stacked = false, sub }) {
  if (stacked) {
    return (
      <div className="flex flex-col items-center">
        <Isotipo size={size * 2.4} />
        <div className="text-center mt-2">
          <div className="display leading-none" style={{ fontSize: size * 0.9, letterSpacing: "0.03em" }}>
            ENTRENAMOS
          </div>
          {sub && (
            <div className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              {sub}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Isotipo size={size} />
      <span className="display leading-none" style={{ fontSize: size * 0.62, letterSpacing: "0.03em" }}>
        ENTRENAMOS
      </span>
    </div>
  );
}

/* ---------- los personajes ---------- */

/* Cuerpo entero. Se usa donde el protagonista es la persona:
   el día de descanso, el final de una sesión. */
export function Personaje({ quien = "ignacio", size = 180, className = "", style }) {
  return (
    <img
      src={`/marca/${quien}.webp`}
      alt=""
      aria-hidden="true"
      className={className}
      style={{ height: size, width: "auto", display: "block", ...style }}
    />
  );
}

/* Cabeza y hombros, recortado en cuadrado: sirve de foto de perfil. */
export function Cara({ quien = "ignacio", size = 48, anillo, className = "" }) {
  return (
    <span
      className={"inline-flex items-center justify-center overflow-hidden shrink-0 rounded-2xl " + className}
      style={{
        width: size,
        height: size,
        background: "var(--surface-2)",
        boxShadow: anillo ? `inset 0 0 0 2px ${anillo}` : "none",
      }}
    >
      <img
        src={`/marca/${quien}-cara.webp`}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </span>
  );
}

export default Logo;
