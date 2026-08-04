import React, { useState } from "react";
import { ChevronRight, Flame } from "lucide-react";
import { C } from "../data/theme";
import { PROGRAMS, ORDER, WEEK_GOAL, ABS_DAYS } from "../data/programs";
import { startOfWeek } from "../lib/store";
import { Card, Section, labelStyle } from "./ui";

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

  return (
    <div className="px-4">
      {todays.length > 0 && !picking ? (
        <div className="space-y-3">
          {todays.map((k) => (
            <Card key={k} lane={lane} day={prog[k]} done={doneIds.includes(k)} onStart={() => onStart(k)} />
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest mb-3" style={labelStyle}>
            {todays.length ? "Elige otra sesión" : "Hoy toca descansar — si quieres entrenar igual, elige"}
          </p>
          <div className="space-y-2">
            {ORDER[program].map((k) => (
              <button key={k} onClick={() => onStart(k)}
                className="w-full text-left p-4 rounded-2xl flex items-center justify-between"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div>
                  <div className="text-base font-semibold">{prog[k].name}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                    {prog[k].day} · {prog[k].focus}
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: C.faint }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setPicking(!picking)}
        className="w-full mt-3 py-3 rounded-xl text-sm font-medium"
        style={{ color: C.muted, background: C.surface, border: `1px solid ${C.border}` }}>
        {picking ? "Volver" : "Entrenar otra sesión"}
      </button>

      <div className="mt-6">
        <Section>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest" style={labelStyle}>Esta semana</span>
            <span className="text-xs" style={{ color: thisWeek.length >= goal ? C.done : C.muted }}>
              {thisWeek.length} de {goal}
            </span>
          </div>
          <div className="flex gap-1.5">
            {ORDER[program].map((k) => {
              const ok = doneIds.includes(k);
              return (
                <div key={k} className="flex-1 rounded-lg py-2.5 text-center"
                     style={{
                       background: ok ? lane.soft : C.surface2,
                       color: ok ? lane.accent : C.faint,
                       boxShadow: ok ? `inset 0 0 0 1px ${lane.accent}` : "none",
                     }}>
                  <div className="text-xs font-semibold"
                       style={{ fontFamily: "Barlow Condensed", letterSpacing: "0.06em" }}>
                    {prog[k].day.slice(0, 3).toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: C.faint }}>
            {goal === 3
              ? "Con 3 sesiones la semana está cumplida. Lo que venga arriba es ganancia."
              : "Con 2 sesiones la semana ya cuenta. Cuatro es el ideal, no el mínimo."}
          </p>
        </Section>
      </div>

      {streak > 0 && (
        <div className="mt-3">
          <Section>
            <div className="flex items-center gap-3">
              <Flame size={20} style={{ color: lane.accent }} />
              <div>
                <div className="text-sm font-semibold">
                  {streak} {streak === 1 ? "semana seguida" : "semanas seguidas"}
                </div>
                <div className="text-xs" style={{ color: C.muted }}>Sin romper la racha</div>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
