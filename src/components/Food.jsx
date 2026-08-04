import React from "react";
import { Check } from "lucide-react";
import { C } from "../data/theme";
import { MEALS, SUPPS, TARGETS } from "../data/meals";
import { todayKey } from "../lib/store";
import { Bar, labelStyle } from "./ui";

export default function Food({ program, data, lane, onToggleMeal, onToggleSupp }) {
  const day = todayKey();
  const meals = MEALS[program];
  const supps = SUPPS[program];
  const t = TARGETS[program];
  const checks = data.meals[day] || {};
  const sc = data.supps[day] || {};

  const eaten = meals.filter((m) => checks[m.id]);
  const kcal = eaten.reduce((a, m) => a + m.kcal, 0);
  const prot = eaten.reduce((a, m) => a + m.p, 0);

  return (
    <div className="px-4">
      <div className="rounded-3xl p-5 mb-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="text-xs uppercase tracking-widest mb-3" style={{ ...labelStyle, color: lane.accent }}>
          Hoy
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Bar text="Calorías" value={kcal} max={t.kcal} unit="kcal" lane={lane} />
          <Bar text="Proteína" value={prot} max={t.p} unit="g" lane={lane} />
        </div>
      </div>

      <div className="space-y-3">
        {meals.map((m) => {
          const on = !!checks[m.id];
          return (
            <div key={m.id} className="rounded-2xl overflow-hidden"
                 style={{ background: C.surface, border: `1px solid ${on ? lane.accent : C.border}` }}>
              <button onClick={() => onToggleMeal(m.id)} className="w-full px-4 py-3 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-base font-semibold">{m.name}</div>
                  <div className="text-xs" style={{ color: C.muted }}>~{m.kcal} kcal · {m.p}g proteína</div>
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: on ? lane.accent : "transparent",
                              border: `1.5px solid ${on ? lane.accent : C.border}` }}>
                  {on && <Check size={15} strokeWidth={3} color={C.bg} />}
                </div>
              </button>
              <div className="px-4 pb-3 space-y-1.5">
                {m.opts.map((o, i) => (
                  <div key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.muted }}>
                    <span style={{ color: C.faint }}>{String.fromCharCode(65 + i)}</span>
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest mb-2" style={labelStyle}>
          {program === "linda" ? "Suplementos e hidratación" : "Suplementos"}
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          {supps.map((s, i) => {
            const on = !!sc[s.id];
            return (
              <button key={s.id} onClick={() => onToggleSupp(s.id)}
                className="w-full px-4 py-3 flex items-center justify-between"
                style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                <div className="text-left">
                  <div className="text-sm font-medium" style={{ color: on ? C.text : C.muted }}>{s.name}</div>
                  <div className="text-xs" style={{ color: C.faint }}>{s.when}</div>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: on ? lane.accent : "transparent",
                              border: `1.5px solid ${on ? lane.accent : C.border}` }}>
                  {on && <Check size={13} strokeWidth={3} color={C.bg} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs mt-5 leading-relaxed" style={{ color: C.faint }}>
        {program === "linda"
          ? "Plan entregado por tu entrenadora. Elige una opción de cada comida y marca cuando la comas."
          : "No hace falta pesar todo. Elige una opción de cada comida y toma 2.5 a 3 litros de agua al día."}
      </p>
    </div>
  );
}
