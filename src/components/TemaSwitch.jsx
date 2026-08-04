import React from "react";
import { Sun, Moon, SunMoon } from "lucide-react";
import { C } from "../data/theme";

/* ============================================================
   Interruptor claro / oscuro.

   Tres posiciones. "Auto" sigue al teléfono, que de noche se pone
   oscuro solo — es la opción cómoda para el día a día. Las otras
   dos fuerzan uno u otro.

   La pastilla que marca la opción activa se desliza; no aparece y
   desaparece. Detalle chico, pero es lo que hace que se sienta
   una app y no una página.
   ============================================================ */

const OPCIONES = [
  { k: "auto", label: "Auto", Icon: SunMoon },
  { k: "claro", label: "Claro", Icon: Sun },
  { k: "oscuro", label: "Oscuro", Icon: Moon },
];

export default function TemaSwitch({ modo, onChange, lane }) {
  const i = Math.max(0, OPCIONES.findIndex((o) => o.k === modo));

  return (
    <div
      className="relative grid grid-cols-3 gap-1 p-1 rounded-2xl"
      style={{ background: C.surface2, border: `1px solid ${C.border}` }}
    >
      {/* Pastilla deslizante */}
      <div
        className="absolute top-1 bottom-1 rounded-xl pointer-events-none"
        style={{
          left: `calc(${(i * 100) / 3}% + 4px)`,
          width: `calc(${100 / 3}% - 8px)`,
          background: lane.accent,
          boxShadow: `0 6px 16px -8px ${lane.glow}`,
          transition: "left 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      {OPCIONES.map(({ k, label, Icon }) => {
        const on = k === modo;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className="relative py-2.5 rounded-xl flex flex-col items-center gap-1"
            style={{ color: on ? "#fff" : C.muted }}
          >
            <Icon size={15} strokeWidth={2.2} />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
