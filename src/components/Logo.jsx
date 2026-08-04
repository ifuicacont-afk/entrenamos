import React from "react";

/* ============================================================
   ISOTIPO — Entrenamos

   Dos arcos que juntos cierran un anillo: dos personas, un mismo
   método. El anillo es además el motivo que se repite en toda la
   app (el progreso del día, del mes, de las calorías), así que la
   marca y la interfaz hablan el mismo idioma.

   Dentro, una barra con discos: lo que los dos comparten.
   ============================================================ */

const R = 17;
const LARGO = 2 * Math.PI * R;
const ARCO = (LARGO * 148) / 360; // cada arco cubre 148°, deja dos calados

export function Isotipo({ size = 40, a = "var(--accent)", b = "var(--brand)", barra = "var(--text)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Arco de arriba */}
      <circle
        cx="24" cy="24" r={R}
        stroke={a} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${ARCO} ${LARGO - ARCO}`}
        transform="rotate(-84 24 24)"
      />
      {/* Arco de abajo */}
      <circle
        cx="24" cy="24" r={R}
        stroke={b} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${ARCO} ${LARGO - ARCO}`}
        transform="rotate(96 24 24)"
      />
      {/* Barra */}
      <rect x="16.5" y="22.4" width="15" height="3.2" rx="1.6" fill={barra} />
      {/* Discos */}
      <rect x="14" y="19.6" width="3.4" height="8.8" rx="1.7" fill={barra} />
      <rect x="30.6" y="19.6" width="3.4" height="8.8" rx="1.7" fill={barra} />
    </svg>
  );
}

/* Marca completa: isotipo + nombre. */
export function Logo({ size = 34, stacked = false, sub }) {
  if (stacked) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Isotipo size={size} />
        <div className="text-center">
          <div className="display leading-none" style={{ fontSize: size * 0.86, letterSpacing: "0.02em" }}>
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
      <span className="display leading-none" style={{ fontSize: size * 0.6, letterSpacing: "0.03em" }}>
        ENTRENAMOS
      </span>
    </div>
  );
}

export default Logo;
