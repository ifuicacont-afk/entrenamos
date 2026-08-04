import React from "react";
import { Check, Pill } from "lucide-react";
import { C } from "../data/theme";
import { MEALS, SUPPS, TARGETS } from "../data/meals";
import { todayKey } from "../lib/store";
import { Section, Ring, labelStyle } from "./ui";

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

  const pctKcal = Math.min(100, Math.round((kcal / t.kcal) * 100));
  const pctProt = Math.min(100, Math.round((prot / t.p) * 100));

  return (
    <div className="px-4 rise">
      {/* ---- resumen del día ---- */}
      <Section raised className="mb-4">
        <div className="text-xs mb-4" style={labelStyle}>Hoy</div>
        <div className="flex items-center justify-around">
          <Ring pct={pctKcal} size={112} grosor={10} color={lane.accent}>
            <span className="display text-2xl leading-none">{kcal}</span>
            <span className="text-xs" style={{ color: C.faint }}>de {t.kcal}</span>
            <span className="text-xs mt-0.5 font-semibold" style={{ color: lane.accent, fontSize: 10 }}>
              KCAL
            </span>
          </Ring>
          <Ring pct={pctProt} size={112} grosor={10} color={C.brand}>
            <span className="display text-2xl leading-none">{prot}</span>
            <span className="text-xs" style={{ color: C.faint }}>de {t.p} g</span>
            <span className="text-xs mt-0.5 font-semibold" style={{ color: C.brand, fontSize: 10 }}>
              PROTEÍNA
            </span>
          </Ring>
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: C.faint }}>
          {eaten.length} de {meals.length} comidas marcadas
        </p>
      </Section>

      {/* ---- comidas ---- */}
      <div className="space-y-3">
        {meals.map((m) => {
          const on = !!checks[m.id];
          return (
            <div key={m.id} className="rounded-3xl overflow-hidden"
                 style={{
                   background: C.card,
                   border: `1px solid ${on ? lane.accent : C.border}`,
                   boxShadow: on ? `0 10px 24px -16px ${lane.glow}` : "var(--shadow-sm)",
                 }}>
              <button onClick={() => onToggleMeal(m.id)}
                      className="w-full px-4 py-3.5 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-base font-semibold">{m.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                    ~{m.kcal} kcal · {m.p} g proteína
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                     style={{
                       background: on ? lane.accent : "transparent",
                       border: `1.5px solid ${on ? lane.accent : C.border}`,
                       boxShadow: on ? `0 6px 14px -6px ${lane.glow}` : "none",
                     }}>
                  {on && <Check size={16} strokeWidth={3} color="#fff" />}
                </div>
              </button>
              <div className="px-4 pb-3.5 space-y-2">
                {m.opts.map((o, i) => (
                  <div key={i} className="flex gap-2.5 text-xs leading-relaxed items-start"
                       style={{ color: C.muted }}>
                    <span className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-px
                                     text-xs font-bold"
                          style={{ background: C.surface2, color: C.faint, fontSize: 9 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- suplementos ---- */}
      <div className="mt-6">
        <div className="text-xs mb-2.5 px-1" style={labelStyle}>
          {program === "linda" ? "Suplementos e hidratación" : "Suplementos"}
        </div>
        <div className="rounded-3xl overflow-hidden"
             style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-sm)" }}>
          {supps.map((s, i) => {
            const on = !!sc[s.id];
            return (
              <button key={s.id} onClick={() => onToggleSupp(s.id)}
                className="w-full px-4 py-3 flex items-center justify-between"
                style={{ borderTop: i ? `1px solid ${C.borderSoft}` : "none" }}>
                <div className="flex items-center gap-3 text-left">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: on ? lane.soft : C.surface2 }}>
                    <Pill size={14} style={{ color: on ? lane.accent : C.faint }} />
                  </span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: on ? C.text : C.muted }}>
                      {s.name}
                    </div>
                    <div className="text-xs" style={{ color: C.faint }}>{s.when}</div>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                     style={{
                       background: on ? lane.accent : "transparent",
                       border: `1.5px solid ${on ? lane.accent : C.border}`,
                     }}>
                  {on && <Check size={13} strokeWidth={3} color="#fff" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs mt-5 leading-relaxed px-1" style={{ color: C.faint }}>
        {program === "linda"
          ? "Plan entregado por tu entrenadora. Elige una opción de cada comida y marca cuando la comas."
          : "No hace falta pesar todo. Elige una opción de cada comida y toma 2.5 a 3 litros de agua al día."}
      </p>

      <div className="h-2" />
    </div>
  );
}
