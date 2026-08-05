import React from "react";
import { Check, Sparkles } from "lucide-react";
import { C, COLORES, LANES } from "../data/theme";

/* ============================================================
   Elegir el color de la app.

   Cada círculo se pinta con el tono real que va a tomar en el tema
   que está activo, no con una versión de muestra: lo que se ve en
   el botón es exactamente lo que se verá en la app.

   "Del plan" deja el color que trae cada programa —naranjo para
   Ignacio, turquesa para Linda— y es la opción por defecto.
   ============================================================ */

export default function ColorSwitch({ color, onChange, tema, program }) {
  const claro = tema === "light";
  const delPlan = LANES[program] ?? LANES.ignacio;

  return (
    <div className="grid grid-cols-5 gap-2.5">
      {COLORES.map((c) => {
        const on = c.id === color;
        const esAuto = c.id === "auto";
        const tono = esAuto ? delPlan.accent : claro ? c.claro : c.oscuro;

        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            title={c.nombre}
            aria-label={c.nombre}
            aria-pressed={on}
            className="flex flex-col items-center gap-1.5 active:scale-95"
            style={{ transition: "transform 0.12s ease" }}
          >
            <span
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: esAuto ? C.surface2 : tono,
                boxShadow: on
                  ? `0 0 0 2px ${C.surface}, 0 0 0 4px ${tono}`
                  : `inset 0 0 0 1px ${C.border}`,
                transition: "box-shadow 0.2s ease",
              }}
            >
              {esAuto ? (
                <Sparkles size={17} style={{ color: tono }} strokeWidth={2.4} />
              ) : (
                on && <Check size={18} strokeWidth={3.5} color="#fff" />
              )}
            </span>
            <span
              className="text-xs leading-none text-center"
              style={{ color: on ? C.text : C.faint, fontWeight: on ? 700 : 500 }}
            >
              {c.nombre}
            </span>
          </button>
        );
      })}
    </div>
  );
}
