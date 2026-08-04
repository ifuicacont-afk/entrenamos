import React from "react";
import { Play, Plus, Minus } from "lucide-react";
import { C, SHADOW } from "../data/theme";

/* ============================================================
   PIEZAS DE INTERFAZ

   Todo lo que se repite en la app vive acá: tarjetas con relieve,
   anillos de progreso, botones cápsula, gráficos. Ninguna escribe
   un color a mano — todas piden variables del tema, así funcionan
   igual en claro y en oscuro.
   ============================================================ */

export const labelStyle = {
  color: C.faint,
  fontFamily: "Barlow Condensed",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

/* ---------- superficies ---------- */

/* La tarjeta base: degradado sutil + borde fino + sombra.
   Esos tres detalles juntos son los que la despegan del fondo. */
export function Section({ children, className = "", raised, style }) {
  return (
    <div
      className={"rounded-3xl p-4 " + className}
      style={{
        background: raised ? C.cardRaised : C.card,
        border: `1px solid ${C.border}`,
        boxShadow: raised ? SHADOW.md : SHADOW.sm,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Bloque de color con textura: encabeza las pantallas. */
export function Hero({ lane, children, className = "" }) {
  return (
    <div
      className={"relative overflow-hidden rounded-3xl grain " + className}
      style={{
        background: `linear-gradient(145deg, ${lane.accent} 0%, ${lane.accent} 40%, ${C.brand} 145%)`,
        boxShadow: `0 16px 40px -14px ${lane.glow}`,
      }}
    >
      {/* Dos círculos apenas visibles: dan profundidad al plano. */}
      <div className="absolute rounded-full pointer-events-none"
           style={{ width: 200, height: 200, right: -70, top: -90, background: "rgba(255,255,255,0.13)" }} />
      <div className="absolute rounded-full pointer-events-none"
           style={{ width: 130, height: 130, right: 24, bottom: -80, background: "rgba(255,255,255,0.09)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ---------- anillo de progreso ---------- */

/* El motivo que se repite en toda la app. Acepta contenido al
   centro, así sirve para un porcentaje, una cifra o un ícono. */
export function Ring({
  pct = 0,
  size = 120,
  grosor = 10,
  color = "var(--accent)",
  track = C.ringTrack,
  children,
  animar = true,
}) {
  const r = (size - grosor) / 2;
  const largo = 2 * Math.PI * r;
  const avance = Math.max(0, Math.min(100, pct));
  const dash = (avance / 100) * largo;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={grosor} />
        {avance > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={grosor} strokeLinecap="round"
            strokeDasharray={`${dash} ${largo}`}
            style={
              animar
                ? { "--len": dash, animation: "ring-in 0.9s cubic-bezier(0.22,1,0.36,1) both" }
                : undefined
            }
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

/* ---------- botones ---------- */

export function Boton({ children, onClick, lane, variante = "solido", className = "", ...rest }) {
  const estilos = {
    solido: {
      background: `linear-gradient(135deg, ${lane.accent} 0%, ${lane.accent} 60%, ${C.brand} 190%)`,
      color: "#fff",
      boxShadow: `0 10px 24px -10px ${lane.glow}`,
      border: "1px solid transparent",
    },
    suave: {
      background: lane.soft,
      color: lane.accent,
      border: `1px solid ${lane.accent}`,
      boxShadow: "none",
    },
    fantasma: {
      background: C.surface2,
      color: C.muted,
      border: `1px solid ${C.border}`,
      boxShadow: "none",
    },
  }[variante];

  return (
    <button
      onClick={onClick}
      className={
        "w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 " +
        "active:scale-[0.985] disabled:opacity-50 " + className
      }
      style={{ transition: "transform 0.12s ease", ...estilos }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Chip({ children, activo, lane, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={"px-3 py-1.5 rounded-full text-xs font-semibold " + className}
      style={{
        background: activo ? lane.accent : C.surface2,
        color: activo ? "#fff" : C.muted,
        border: `1px solid ${activo ? "transparent" : C.border}`,
        boxShadow: activo ? `0 6px 14px -6px ${lane.glow}` : "none",
      }}
    >
      {children}
    </button>
  );
}

/* ---------- tarjeta de sesión ---------- */

export function Card({ lane, day, done, onStart }) {
  return (
    <Hero lane={lane} className="p-5">
      <div className="text-xs mb-1 font-semibold"
           style={{ ...labelStyle, color: "rgba(255,255,255,0.75)" }}>
        {day.day} · hoy
      </div>
      <h1 className="display text-4xl leading-none" style={{ color: "#fff" }}>
        {day.name.toUpperCase()}
      </h1>
      <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.86)" }}>{day.focus}</p>

      <div className="flex gap-2 mt-4 flex-wrap">
        <Etiqueta>{day.ex.length} ejercicios</Etiqueta>
        <Etiqueta>~{day.mins} min</Etiqueta>
        {day.cardio ? <Etiqueta>+{day.cardio} min cardio</Etiqueta> : null}
      </div>

      <button
        onClick={onStart}
        className="w-full mt-5 py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-bold active:scale-[0.985]"
        style={{
          background: "#fff",
          color: lane.accent,
          transition: "transform 0.12s ease",
          boxShadow: "0 10px 22px -12px rgba(0,0,0,0.5)",
        }}
      >
        <Play size={18} strokeWidth={2.5} fill="currentColor" />
        {done ? "Repetir sesión" : "Empezar"}
      </button>

      {done && (
        <p className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.85)" }}>
          Ya la hiciste esta semana
        </p>
      )}
    </Hero>
  );
}

function Etiqueta({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
      {children}
    </span>
  );
}

/* ---------- controles ---------- */

export function Stepper({ text, value, unit, step, min, onChange, lane }) {
  const boton = {
    background: C.surface2,
    color: C.text,
    border: `1px solid ${C.border}`,
  };
  return (
    <div className="rounded-2xl p-3" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: SHADOW.sm }}>
      <div className="text-xs mb-2 text-center" style={{ ...labelStyle, letterSpacing: "0.14em" }}>
        {text}
      </div>
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => onChange(Math.max(min, value - step))} aria-label="Menos"
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 active:scale-95"
          style={{ ...boton, transition: "transform 0.12s ease" }}>
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <div className="text-center leading-none">
          <div className="display text-4xl" style={{ color: lane.accent }}>{value}</div>
          <div className="text-xs mt-1" style={{ color: C.faint }}>{unit}</div>
        </div>
        <button onClick={() => onChange(value + step)} aria-label="Más"
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 active:scale-95"
          style={{ ...boton, transition: "transform 0.12s ease" }}>
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function Input({ className = "", style, ...rest }) {
  return (
    <input
      {...rest}
      className={"px-4 py-3 rounded-2xl text-sm outline-none " + className}
      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}`, ...style }}
    />
  );
}

/* ---------- datos ---------- */

export function Stat({ text, value, lane }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ background: C.surface2, border: `1px solid ${C.borderSoft}` }}>
      <div className="display text-3xl leading-none" style={{ color: lane.accent }}>{value}</div>
      <div className="text-xs mt-1.5" style={{ color: C.muted }}>{text}</div>
    </div>
  );
}

export function Tile({ icon: Icon, value, label, lane }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: C.surface2, border: `1px solid ${C.borderSoft}` }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
           style={{ background: lane.soft }}>
        <Icon size={14} style={{ color: lane.accent }} />
      </div>
      <div className="display text-2xl leading-none" style={{ color: C.text }}>{value}</div>
      <div className="text-xs mt-1 leading-tight" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}

/* Barra de avance con cifra grande encima. */
export function Bar({ text, value, max, unit, lane }) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="display text-3xl leading-none" style={{ color: lane.accent }}>{value}</span>
        <span className="text-xs" style={{ color: C.faint }}>/ {max} {unit}</span>
      </div>
      <div className="h-2 rounded-full mt-2 overflow-hidden" style={{ background: C.ringTrack }}>
        <div className="h-full rounded-full"
             style={{
               width: `${pct}%`,
               background: `linear-gradient(90deg, ${lane.accent}, ${C.brand})`,
               transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
             }} />
      </div>
      <div className="text-xs mt-1.5" style={{ color: C.muted }}>{text}</div>
    </div>
  );
}

/* Gráfico de barras: una barra por día o por semana. */
export function Barras({ datos, lane, alto = 90, unidad = "" }) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height: alto }}>
      {datos.map((d, i) => {
        const h = Math.max(4, (d.valor / max) * (alto - 22));
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5">
            {d.valor > 0 && (
              <span className="text-xs font-semibold leading-none" style={{ color: C.muted, fontSize: 10 }}>
                {d.valor}{unidad}
              </span>
            )}
            <div
              className="w-full rounded-lg"
              style={{
                height: h,
                background: d.destacado
                  ? `linear-gradient(180deg, ${lane.accent}, ${C.brand})`
                  : d.valor > 0 ? lane.soft : C.ringTrack,
                border: d.valor > 0 && !d.destacado ? `1px solid ${lane.accent}` : "none",
                transition: "height 0.5s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            <span className="text-xs" style={{ color: d.destacado ? lane.accent : C.faint, fontSize: 10 }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* Línea de peso corporal, con área bajo la curva. */
export function Spark({ data, lane }) {
  const w = 300, h = 72, pad = 6;
  const ks = data.map((d) => d.kg);
  const min = Math.min(...ks), max = Math.max(...ks), span = max - min || 1;
  const xy = (d, i) => [
    pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2),
    h - pad - ((d.kg - min) / span) * (h - pad * 2.5),
  ];
  const puntos = data.map((d, i) => xy(d, i));
  const linea = puntos.map((p) => p.join(",")).join(" ");
  const area = `${pad},${h} ${linea} ${w - pad},${h}`;
  const id = "spark-" + data.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 72 }} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={linea} fill="none" stroke={lane.accent} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
      {puntos.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === puntos.length - 1 ? 4 : 2.5}
                fill={i === puntos.length - 1 ? lane.accent : C.surface}
                stroke={lane.accent} strokeWidth="2" />
      ))}
    </svg>
  );
}
