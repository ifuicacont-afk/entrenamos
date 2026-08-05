import React, { useState } from "react";
import { Bike, CloudOff, Scale, History } from "lucide-react";
import { C } from "../data/theme";
import { isConfigured } from "../lib/supabase";
import { startOfWeek } from "../lib/store";
import { Spark, Section, Input, Barras, Stat, labelStyle } from "./ui";
import { Vacio } from "./Illustration";

/* ============================================================
   Progreso.

   Solo datos: cómo va el peso, la constancia de las últimas semanas,
   el cardio y el historial de sesiones.

   Los ajustes (tema, color, videos, cerrar sesión) se fueron al menú
   lateral. Antes estaban acá y la pantalla era un cajón donde había
   que pasar por encima de la configuración para llegar a los
   gráficos.
   ============================================================ */

export default function Progress({ data, lane, onAddWeight, onAddRide }) {
  const [kg, setKg] = useState("");
  const [ride, setRide] = useState("");

  const submitWeight = () => {
    const v = parseFloat(kg.replace(",", "."));
    if (!v || v < 30 || v > 250) return;
    onAddWeight(v);
    setKg("");
  };

  const submitRide = () => {
    const v = parseInt(ride, 10);
    if (!v || v < 1 || v > 600) return;
    onAddRide(v);
    setRide("");
  };

  const log = [...data.weightLog].reverse();
  const delta = log.length > 1 ? log[log.length - 1].kg - log[0].kg : null;
  const actual = log.length ? log[log.length - 1].kg : null;

  /* Sesiones por semana, últimas 8. */
  const semanas = (() => {
    const out = [];
    const base = startOfWeek(new Date());
    for (let w = 7; w >= 0; w--) {
      const s = new Date(base); s.setDate(s.getDate() - 7 * w);
      const e = new Date(s); e.setDate(e.getDate() + 7);
      const n = data.sessions.filter((x) => {
        const d = new Date(x.date + "T12:00");
        return d >= s && d < e;
      }).length;
      out.push({
        label: `${s.getDate()}/${s.getMonth() + 1}`,
        valor: n,
        destacado: w === 0,
      });
    }
    return out;
  })();

  const totalCardio = data.rides.reduce((a, r) => a + r.mins, 0);

  return (
    <div className="px-4 space-y-4 rise">
      {!isConfigured && (
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
             style={{ background: "rgba(255,180,60,0.10)", border: "1px solid rgba(255,180,60,0.25)" }}>
          <CloudOff size={15} style={{ color: C.warn, marginTop: 1 }} />
          <p className="text-xs leading-relaxed" style={{ color: C.warn }}>
            Supabase no está configurado. Los datos se guardan solo en este dispositivo y no se
            sincronizan. Revisa el archivo <code>.env</code>.
          </p>
        </div>
      )}

      {/* ---- peso corporal ---- */}
      <Section raised>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale size={15} style={{ color: lane.accent }} />
            <span className="text-xs" style={labelStyle}>Peso corporal</span>
          </div>
          {delta != null && (
            <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    background: delta <= 0 ? "rgba(91,217,138,0.14)" : C.surface2,
                    color: delta <= 0 ? C.done : C.muted,
                  }}>
              {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg
            </span>
          )}
        </div>

        {actual != null && (
          <div className="display text-5xl leading-none mb-3" style={{ color: lane.accent }}>
            {actual}
            <span className="text-lg ml-1" style={{ color: C.faint }}>kg</span>
          </div>
        )}

        {log.length > 1 && <Spark data={log} lane={lane} />}

        <div className="flex gap-2 mt-3">
          <Input value={kg} onChange={(e) => setKg(e.target.value)} inputMode="decimal"
                 placeholder="Peso de hoy en kg" className="flex-1"
                 onKeyDown={(e) => e.key === "Enter" && submitWeight()} />
          <button onClick={submitWeight} className="px-5 rounded-2xl text-sm font-bold"
                  style={{ background: lane.accent, color: "#fff",
                           boxShadow: `0 8px 18px -10px ${lane.glow}` }}>
            Anotar
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: C.faint }}>
          Una vez por semana, mismo día y hora, en ayunas.
        </p>
      </Section>

      {/* ---- constancia ---- */}
      <Section>
        <div className="flex items-center gap-2 mb-3">
          <History size={15} style={{ color: lane.accent }} />
          <span className="text-xs" style={labelStyle}>Últimas 8 semanas</span>
        </div>
        <Barras datos={semanas} lane={lane} alto={104} />
        <p className="text-xs mt-3" style={{ color: C.faint }}>
          Cada barra es una semana. La última, destacada, es la que estás viviendo.
        </p>
      </Section>

      {/* ---- cardio ---- */}
      <Section>
        <div className="flex items-center gap-2 mb-3">
          <Bike size={15} style={{ color: lane.accent }} />
          <span className="text-xs" style={labelStyle}>Cardio, bici y remo</span>
        </div>
        <div className="flex gap-2">
          <Input value={ride} onChange={(e) => setRide(e.target.value)} inputMode="numeric"
                 placeholder="Minutos" className="flex-1"
                 onKeyDown={(e) => e.key === "Enter" && submitRide()} />
          <button onClick={submitRide} className="px-5 rounded-2xl text-sm font-bold"
                  style={{ background: lane.soft, color: lane.accent, border: `1px solid ${lane.accent}` }}>
            Anotar
          </button>
        </div>
        {data.rides.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Stat text="Sesiones de cardio" value={data.rides.length} lane={lane} />
            <Stat text="Minutos en total" value={totalCardio} lane={lane} />
          </div>
        )}
      </Section>

      {/* ---- historial ---- */}
      <div className="rounded-3xl overflow-hidden"
           style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-sm)" }}>
        <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <span className="text-xs" style={labelStyle}>
            Sesiones · {data.sessions.length} en total
          </span>
        </div>
        {data.sessions.length === 0 ? (
          <div className="px-4 py-7 flex flex-col items-center gap-2">
            <Vacio size={104} />
            <p className="text-sm text-center" style={{ color: C.faint }}>
              Todavía no hay sesiones. La primera aparece acá cuando termines de entrenar.
            </p>
          </div>
        ) : (
          data.sessions.slice(0, 12).map((s, i) => {
            const vol = s.ex.reduce((a, e) => a + e.sets.reduce((x, y) => x + y.kg * y.reps, 0), 0);
            return (
              <div key={s.id || i} className="px-4 py-3 flex items-center justify-between"
                   style={{ borderTop: i ? `1px solid ${C.borderSoft}` : "none" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-1 h-9 rounded-full shrink-0" style={{ background: lane.accent }} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-xs" style={{ color: C.faint }}>{s.date} · {s.mins} min</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="display text-lg leading-none" style={{ color: lane.accent }}>
                    {vol.toLocaleString("es-CL")}
                  </div>
                  <div className="text-xs" style={{ color: C.faint }}>kg de volumen</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="h-2" />
    </div>
  );
}
