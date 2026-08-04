import React, { useState } from "react";
import { ChevronRight, Flame, Check } from "lucide-react";
import { C } from "../data/theme";
import { PROGRAMS, ORDER, WEEK_GOAL, ABS_DAYS } from "../data/programs";
import { startOfWeek } from "../lib/store";
import { Card, Section, Ring, labelStyle } from "./ui";
import { Cima } from "./Illustration";
import { Personaje } from "./Logo";

const INICIALES = ["L", "M", "M", "J", "V", "S", "D"];

export default function Home({ program, data, lane, onStart }) {
  const prog = PROGRAMS[program];
  const [picking, setPicking] = useState(false);

  const wd = new Date().getDay();
  const todays = ORDER[program].filter((k) => prog[k].weekday === wd);
  if (program === "linda" && ABS_DAYS.includes(wd) && !todays.includes("ABD")) todays.push("ABD");

  const weekStart = startOfWeek(new Date());
  const thisWeek = data.sessions.filter((s) => new Date(s.date + "T12:00") >= weekStart);
  const doneIds = thisWeek.map((s) => s.dayId);
  const goal = WEEK_GOAL[program];
  const pct = Math.min(100, Math.round((thisWeek.length / goal) * 100));

  const streak = (() => {
    let n = 0;
    for (let w = 0; w < 26; w++) {
      const s = new Date(weekStart); s.setDate(s.getDate() - 7 * w);
      const e = new Date(s); e.setDate(e.getDate() + 7);
      const c = data.sessions.filter((x) => {
        const d = new Date(x.date + "T12:00");
        return d >= s && d < e;
      }).length;
      if (c >= Math.min(2, goal)) n++;
      else if (w > 0) break;
    }
    return n;
  })();

  /* Qué día de la semana entrenó, para la tira de arriba. */
  const diaHecho = (idx) => {
    const dia = new Date(weekStart);
    dia.setDate(dia.getDate() + idx);
    const k = `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, "0")}-${String(dia.getDate()).padStart(2, "0")}`;
    return data.sessions.some((s) => s.date === k);
  };
  const hoyIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="px-4 rise">
      {/* ---- tira de la semana ---- */}
      <div className="flex gap-1.5 mb-4">
        {INICIALES.map((d, i) => {
          const hecho = diaHecho(i);
          const esHoy = i === hoyIdx;
          return (
            <div key={i} className="flex-1 rounded-2xl py-2.5 flex flex-col items-center gap-1.5"
                 style={{
                   background: esHoy ? lane.accent : hecho ? lane.soft : C.surface,
                   border: `1px solid ${esHoy ? "transparent" : hecho ? lane.accent : C.border}`,
                   boxShadow: esHoy ? `0 8px 18px -10px ${lane.glow}` : "none",
                 }}>
              <span className="text-xs font-bold"
                    style={{ color: esHoy ? "#fff" : hecho ? lane.accent : C.faint }}>
                {d}
              </span>
              <span className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: hecho ? (esHoy ? "rgba(255,255,255,0.35)" : lane.accent) : "transparent",
                      border: hecho ? "none" : `1.5px solid ${esHoy ? "rgba(255,255,255,0.5)" : C.border}`,
                    }}>
                {hecho && <Check size={10} strokeWidth={3.5} color="#fff" />}
              </span>
            </div>
          );
        })}
      </div>

      {/* ---- sesión de hoy ---- */}
      {todays.length > 0 && !picking ? (
        <div className="space-y-3">
          {todays.map((k) => (
            <Card key={k} lane={lane} day={prog[k]} done={doneIds.includes(k)} onStart={() => onStart(k)} />
          ))}
        </div>
      ) : (
        <div className="mb-4">
          {!todays.length && !picking && (
            <Section className="mb-3 flex items-center gap-3 overflow-hidden">
              <Personaje quien={program} size={124} style={{ marginBottom: -16, marginLeft: -8 }} />
              <div className="min-w-0">
                <div className="display text-2xl leading-none">HOY DESCANSAS</div>
                <p className="text-xs mt-1.5" style={{ color: C.muted }}>
                  El músculo crece en el descanso, no en el gimnasio. Si igual quieres
                  moverte, elige una sesión abajo.
                </p>
              </div>
            </Section>
          )}
          <p className="text-xs mb-3 px-1" style={labelStyle}>
            {todays.length ? "Elige otra sesión" : "Entrenar igual"}
          </p>
          <div className="space-y-2">
            {ORDER[program].map((k) => (
              <button key={k} onClick={() => onStart(k)}
                className="w-full text-left p-4 rounded-2xl flex items-center justify-between active:scale-[0.99]"
                style={{ background: C.card, border: `1px solid ${C.border}`,
                         boxShadow: "var(--shadow-sm)", transition: "transform 0.12s ease" }}>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-10 rounded-full" style={{ background: lane.accent }} />
                  <div>
                    <div className="text-base font-semibold">{prog[k].name}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {prog[k].day} · {prog[k].focus}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: C.faint }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setPicking(!picking)}
        className="w-full mt-3 py-3.5 rounded-2xl text-sm font-semibold"
        style={{ color: C.muted, background: C.surface, border: `1px solid ${C.border}` }}>
        {picking ? "Volver" : "Entrenar otra sesión"}
      </button>

      {/* ---- avance de la semana ---- */}
      <div className="mt-4">
        <Section raised>
          <div className="flex items-center gap-5">
            <Ring pct={pct} size={104} grosor={9} color={lane.accent}>
              <span className="display text-3xl leading-none" style={{ color: lane.accent }}>{pct}%</span>
              <span className="text-xs" style={{ color: C.faint }}>semana</span>
            </Ring>
            <div className="min-w-0">
              <div className="text-xs" style={labelStyle}>Esta semana</div>
              <div className="display text-4xl leading-none mt-1.5">
                {thisWeek.length}<span style={{ color: C.faint }}>/{goal}</span>
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: C.muted }}>
                {thisWeek.length >= goal
                  ? "Semana cumplida. Lo que venga arriba es ganancia."
                  : goal === 3
                  ? "Con 3 sesiones la semana está cumplida."
                  : "Con 2 sesiones ya cuenta. Cuatro es el ideal, no el mínimo."}
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* ---- racha ---- */}
      {streak > 0 && (
        <div className="mt-3">
          <Section className="flex items-center gap-3">
            <Cima size={72} />
            <div className="min-w-0">
              <div className="display text-2xl leading-none" style={{ color: lane.accent }}>
                {streak} {streak === 1 ? "SEMANA" : "SEMANAS"}
              </div>
              <div className="text-xs mt-1 flex items-center gap-1.5" style={{ color: C.muted }}>
                <Flame size={12} style={{ color: lane.accent }} />
                Sin romper la racha
              </div>
            </div>
          </Section>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
