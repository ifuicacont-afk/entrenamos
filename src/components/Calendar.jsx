import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Dumbbell, Bike, Scale, Flame, Trophy } from "lucide-react";
import { C } from "../data/theme";
import { PROGRAMS } from "../data/programs";
import {
  keyOf, dayDetail, monthGrid, monthStats, streaks, totales,
  fmtKg, fechaLarga, MESES,
} from "../lib/stats";
import { Section, labelStyle } from "./ui";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

/* "lunes 3 de agosto" → "Lunes 3 de agosto" (y no "Lunes 3 De Agosto") */
const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* El anillo de cada día: cuánto se completó, de un vistazo. */
function Ring({ pct, num, accent, entreno, hoy, sel, futuro }) {
  const r = 14, len = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="w-full" style={{ display: "block" }}>
      <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3"
              stroke={futuro ? "transparent" : C.surface2} />
      {!futuro && pct > 0 && (
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" stroke={accent}
                strokeLinecap="round" transform="rotate(-90 18 18)"
                strokeDasharray={`${(pct / 100) * len} ${len}`} />
      )}
      {sel && <circle cx="18" cy="18" r="17.2" fill="none" strokeWidth="1" stroke={accent} />}
      <text x="18" y={entreno ? 17 : 18} textAnchor="middle" dominantBaseline="central"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            fontSize="13"
            fill={futuro ? C.faint : hoy ? accent : pct > 0 ? C.text : C.muted}>
        {num}
      </text>
      {entreno && <circle cx="18" cy="26" r="1.7" fill={accent} />}
    </svg>
  );
}

/* Barra corta para "3 de 4 comidas". */
function Mini({ label, done, total, accent }) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs" style={{ color: C.muted }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: done ? accent : C.faint }}>
          {done}/{total}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: C.surface2 }}>
        <div className="h-full" style={{ width: `${pct}%`, background: accent }} />
      </div>
    </div>
  );
}

function Tile({ icon: Icon, value, label, accent }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: C.surface2 }}>
      <Icon size={15} style={{ color: accent }} />
      <div className="text-xl font-bold leading-none mt-2"
           style={{ fontFamily: "Barlow Condensed", color: C.text }}>
        {value}
      </div>
      <div className="text-xs mt-1 leading-tight" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}

export default function Calendar({ program, data, lane }) {
  const hoy = keyOf(new Date());
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [sel, setSel] = useState(hoy);

  const cells = monthGrid(cursor.y, cursor.m);
  const stats = monthStats(program, data, cursor.y, cursor.m);
  const racha = streaks(program, data);
  const tot = totales(program, data);
  const det = dayDetail(program, data, sel);

  const esteMes = cursor.y === new Date().getFullYear() && cursor.m === new Date().getMonth();

  /* Al cambiar de mes, el día elegido se mueve con él: hoy si el mes es
     el actual, y si no, el último día de ese mes. */
  const mover = (paso) => {
    const d = new Date(cursor.y, cursor.m + paso, 1);
    const y = d.getFullYear(), m = d.getMonth();
    setCursor({ y, m });

    const inicio = keyOf(new Date(y, m, 1));
    const fin = keyOf(new Date(y, m + 1, 0));
    setSel(hoy >= inicio && hoy <= fin ? hoy : fin < hoy ? fin : inicio);
  };

  const metaPct = stats.meta ? Math.min(100, Math.round((stats.sesiones / stats.meta) * 100)) : 0;

  return (
    <div className="px-4 space-y-4">
      {/* ---- Mes ---- */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => mover(-1)} aria-label="Mes anterior"
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: C.surface2, color: C.muted }}>
            <ChevronLeft size={17} />
          </button>
          <div className="text-center">
            <div className="text-lg font-bold leading-none"
                 style={{ fontFamily: "Barlow Condensed", letterSpacing: "0.04em" }}>
              {MESES[cursor.m].toUpperCase()} {cursor.y}
            </div>
            <div className="text-xs mt-1" style={{ color: C.faint }}>
              {stats.promedio}% de cumplimiento promedio
            </div>
          </div>
          <button onClick={() => mover(1)} disabled={esteMes} aria-label="Mes siguiente"
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                  style={{ background: C.surface2, color: C.muted }}>
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS.map((d, i) => (
            <div key={i} className="text-center text-xs" style={{ ...labelStyle, fontSize: 10 }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((k, i) => {
            if (!k) return <div key={i} />;
            const futuro = k > hoy;
            const d = futuro ? null : dayDetail(program, data, k);
            const pct = d ? d.pct : 0;
            return (
              <button key={k} onClick={() => setSel(k)} disabled={futuro}
                      className="rounded-xl p-0.5"
                      style={{
                        background: !futuro && pct > 0
                          ? `${lane.accent}${Math.round((pct / 100) * 28 + 8).toString(16).padStart(2, "0")}`
                          : "transparent",
                      }}>
                <Ring num={Number(k.slice(8))} pct={pct} accent={lane.accent}
                      entreno={d?.entreno} hoy={k === hoy} sel={k === sel} futuro={futuro} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs" style={{ color: C.faint }}>
            El anillo muestra cuánto completaste ese día.
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: C.faint }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: lane.accent }} />
            entrenaste
          </span>
        </div>
      </Section>

      {/* ---- Día elegido ---- */}
      <Section>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">{capitalizar(fechaLarga(sel))}</div>
            <div className="text-xs mt-0.5" style={{ color: C.faint }}>
              {det.sessions.length
                ? det.sessions.map((s) => s.name).join(" · ")
                : det.descanso
                ? "Día de descanso"
                : det.planned.length
                ? `Tocaba ${det.planned.map((k) => PROGRAMS[program][k].name).join(" y ")}`
                : "Sin sesión"}
            </div>
          </div>
          <div className="text-right shrink-0 ml-3">
            <div className="text-2xl font-bold leading-none"
                 style={{ fontFamily: "Barlow Condensed", color: lane.accent }}>
              {det.pct}%
            </div>
            <div className="text-xs" style={{ color: C.faint }}>del día</div>
          </div>
        </div>

        <div className="flex gap-4">
          <Mini label="Comidas" done={det.meals.done} total={det.meals.total} accent={lane.accent} />
          <Mini label="Suplementos" done={det.supps.done} total={det.supps.total} accent={lane.accent} />
        </div>

        {(det.entreno || det.cardioMins > 0 || det.weight != null) && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3"
               style={{ borderTop: `1px solid ${C.border}` }}>
            {det.entreno && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
                <Dumbbell size={13} style={{ color: lane.accent }} />
                {det.mins} min · {fmtKg(det.volume)} de volumen
              </span>
            )}
            {det.cardioMins > 0 && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
                <Bike size={13} style={{ color: lane.accent }} />
                {det.cardioMins} min de cardio
              </span>
            )}
            {det.weight != null && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
                <Scale size={13} style={{ color: lane.accent }} />
                {det.weight} kg
              </span>
            )}
          </div>
        )}
      </Section>

      {/* ---- Resumen del mes ---- */}
      <Section>
        <div className="text-xs uppercase tracking-widest mb-3" style={labelStyle}>
          Este mes
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm" style={{ color: C.muted }}>
            {stats.sesiones} {stats.sesiones === 1 ? "entrenamiento" : "entrenamientos"}
          </span>
          <span className="text-xs" style={{ color: metaPct >= 100 ? C.done : C.faint }}>
            meta {stats.meta} · {metaPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: C.surface2 }}>
          <div className="h-full transition-all"
               style={{ width: `${metaPct}%`, background: metaPct >= 100 ? C.done : lane.accent }} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Tile icon={Flame} value={`${stats.comida}%`} label="Comidas marcadas" accent={lane.accent} />
          <Tile icon={Bike} value={stats.cardio} label="Minutos de cardio" accent={lane.accent} />
          <Tile icon={Dumbbell} value={fmtKg(stats.volumen)} label="Volumen movido" accent={lane.accent} />
        </div>

        <p className="text-xs mt-3" style={{ color: C.faint }}>
          Registraste algo en {stats.activos} de {stats.dias} días del mes.
        </p>
      </Section>

      {/* ---- Historial completo ---- */}
      <Section>
        <div className="text-xs uppercase tracking-widest mb-3" style={labelStyle}>
          Desde el principio
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Tile icon={Dumbbell} value={tot.sesiones} label="Sesiones en total" accent={lane.accent} />
          <Tile icon={Trophy} value={racha.actual} label={racha.actual === 1 ? "Semana seguida" : "Semanas seguidas"} accent={lane.accent} />
          <Tile icon={Flame} value={racha.mejor} label="Mejor racha" accent={lane.accent} />
        </div>

        <p className="text-xs mt-3 leading-relaxed" style={{ color: C.faint }}>
          {tot.desde
            ? `Tu historial parte el ${fechaLarga(tot.desde)} y ya suma ${tot.dias} ${
                tot.dias === 1 ? "día" : "días"
              } con registro, ${fmtKg(tot.volumen)} movidos y ${tot.minutos + tot.cardio} minutos de trabajo.`
            : "Todavía no hay historial. Cuando termines tu primera sesión, esto empieza a llenarse y no se borra nunca."}
        </p>
      </Section>

      <div className="h-2" />
    </div>
  );
}
