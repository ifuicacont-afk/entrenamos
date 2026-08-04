import React from "react";
import { Play, Plus, Minus } from "lucide-react";
import { C } from "../data/theme";

export const labelStyle = {
  color: C.faint,
  fontFamily: "Barlow Condensed",
  letterSpacing: "0.18em",
};

export function Section({ children, className = "" }) {
  return (
    <div className={"rounded-2xl p-4 " + className}
         style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      {children}
    </div>
  );
}

export function Card({ lane, day, done, onStart }) {
  return (
    <div className="rounded-3xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="text-xs uppercase tracking-widest mb-1" style={{ ...labelStyle, color: lane.accent }}>
        {day.day} · hoy
      </div>
      <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: "Barlow Condensed" }}>
        {day.name.toUpperCase()}
      </h1>
      <p className="text-sm mt-1" style={{ color: C.muted }}>{day.focus}</p>
      <p className="text-xs mt-3" style={{ color: C.faint }}>
        {day.ex.length} ejercicios · unos {day.mins} minutos
        {day.cardio ? ` · ${day.cardio} min de cardio al terminar` : ""}
      </p>
      <button onClick={onStart}
        className="w-full mt-5 py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-bold"
        style={{ background: lane.accent, color: C.bg }}>
        <Play size={18} strokeWidth={2.5} fill={C.bg} />
        {done ? "Repetir sesión" : "Empezar"}
      </button>
      {done && <p className="text-xs mt-3 text-center" style={{ color: C.done }}>Ya la hiciste esta semana</p>}
    </div>
  );
}

export function Stepper({ text, value, unit, step, min, onChange, lane }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="text-xs uppercase tracking-widest mb-2 text-center"
           style={{ ...labelStyle, letterSpacing: "0.14em" }}>
        {text}
      </div>
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => onChange(Math.max(min, value - step))} aria-label="Menos"
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: C.surface2, color: C.text }}>
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <div className="text-center leading-none">
          <div className="text-3xl font-bold" style={{ fontFamily: "Barlow Condensed", color: lane.accent }}>
            {value}
          </div>
          <div className="text-xs mt-0.5" style={{ color: C.faint }}>{unit}</div>
        </div>
        <button onClick={() => onChange(value + step)} aria-label="Más"
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: C.surface2, color: C.text }}>
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function Stat({ text, value, lane }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: C.surface2 }}>
      <div className="text-2xl font-bold leading-none"
           style={{ fontFamily: "Barlow Condensed", color: lane.accent }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: C.muted }}>{text}</div>
    </div>
  );
}

export function Bar({ text, value, max, unit, lane }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold leading-none"
              style={{ fontFamily: "Barlow Condensed", color: lane.accent }}>{value}</span>
        <span className="text-xs" style={{ color: C.faint }}>/ {max} {unit}</span>
      </div>
      <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: C.surface2 }}>
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: lane.accent }} />
      </div>
      <div className="text-xs mt-1.5" style={{ color: C.muted }}>{text}</div>
    </div>
  );
}

export function Spark({ data, lane }) {
  const w = 300, h = 60, pad = 4;
  const ks = data.map((d) => d.kg);
  const min = Math.min(...ks), max = Math.max(...ks), span = max - min || 1;
  const xy = (d, i) => [
    pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2),
    h - pad - ((d.kg - min) / span) * (h - pad * 2),
  ];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }} aria-hidden="true">
      <polyline points={data.map((d, i) => xy(d, i).join(",")).join(" ")} fill="none"
                stroke={lane.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = xy(d, i);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={lane.accent} />;
      })}
    </svg>
  );
}

export function Input({ className = "", style, ...rest }) {
  return (
    <input {...rest} className={"px-3 py-2.5 rounded-xl text-sm outline-none " + className}
      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}`, ...style }} />
  );
}
