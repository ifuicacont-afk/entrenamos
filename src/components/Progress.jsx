import React, { useState } from "react";
import { Bike, Waves, LogOut, CloudOff } from "lucide-react";
import { C } from "../data/theme";
import { isConfigured } from "../lib/supabase";
import { Spark, Section, Input, labelStyle } from "./ui";

export default function Progress({ profile, data, lane, onAddWeight, onAddRide, onSignOut }) {
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

  return (
    <div className="px-4 space-y-4">
      <Section>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold">{profile.name}</div>
            <div className="text-xs" style={{ color: C.faint }}>
              {profile.program === "linda" ? "Plan entrenadora · 5 días" : "Speediance · 4 días"}
            </div>
          </div>
          <button onClick={onSignOut}
            className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5"
            style={{ background: C.surface2, color: C.muted }}>
            <LogOut size={14} /> Salir
          </button>
        </div>
      </Section>

      {!isConfigured && (
        <div className="rounded-2xl p-3 flex items-start gap-2"
             style={{ background: "rgba(255,180,60,0.10)" }}>
          <CloudOff size={15} style={{ color: "#FFB43C", marginTop: 1 }} />
          <p className="text-xs leading-relaxed" style={{ color: "#FFB43C" }}>
            Supabase no está configurado. Los datos se guardan solo en este dispositivo y no se
            sincronizan. Revisa el archivo <code>.env</code>.
          </p>
        </div>
      )}

      <Section>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest" style={labelStyle}>Peso corporal</span>
          {delta != null && (
            <span className="text-xs font-semibold" style={{ color: delta <= 0 ? C.done : C.muted }}>
              {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg
            </span>
          )}
        </div>
        {log.length > 1 && <Spark data={log} lane={lane} />}
        <div className="flex gap-2 mt-3">
          <Input value={kg} onChange={(e) => setKg(e.target.value)} inputMode="decimal"
                 placeholder="Peso de hoy en kg" className="flex-1"
                 onKeyDown={(e) => e.key === "Enter" && submitWeight()} />
          <button onClick={submitWeight} className="px-4 rounded-xl text-sm font-semibold"
                  style={{ background: lane.accent, color: C.bg }}>
            Anotar
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: C.faint }}>
          Una vez por semana, mismo día y hora, en ayunas.
        </p>
      </Section>

      <Section>
        <div className="flex items-center gap-2 mb-3">
          <Bike size={16} style={{ color: lane.accent }} />
          <span className="text-xs uppercase tracking-widest" style={labelStyle}>Cardio, bici y remo</span>
        </div>
        <div className="flex gap-2">
          <Input value={ride} onChange={(e) => setRide(e.target.value)} inputMode="numeric"
                 placeholder="Minutos" className="flex-1"
                 onKeyDown={(e) => e.key === "Enter" && submitRide()} />
          <button onClick={submitRide} className="px-4 rounded-xl text-sm font-semibold"
                  style={{ background: lane.soft, color: lane.accent }}>
            Anotar
          </button>
        </div>
        {data.rides.length > 0 && (
          <div className="mt-3 text-xs" style={{ color: C.muted }}>
            {data.rides.length} sesiones · {data.rides.reduce((a, r) => a + r.mins, 0)} minutos en total
          </div>
        )}
      </Section>

      <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
          <Waves size={16} style={{ color: lane.accent }} />
          <span className="text-xs uppercase tracking-widest" style={labelStyle}>
            Sesiones · {data.sessions.length} en total
          </span>
        </div>
        {data.sessions.length === 0 ? (
          <div className="px-4 py-6 text-sm text-center" style={{ color: C.faint }}>
            Todavía no hay sesiones. La primera aparece acá cuando termines de entrenar.
          </div>
        ) : (
          data.sessions.slice(0, 12).map((s, i) => {
            const vol = s.ex.reduce((a, e) => a + e.sets.reduce((x, y) => x + y.kg * y.reps, 0), 0);
            return (
              <div key={i} className="px-4 py-3 flex items-center justify-between"
                   style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs" style={{ color: C.faint }}>{s.date} · {s.mins} min</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold"
                       style={{ fontFamily: "Barlow Condensed", color: lane.accent }}>{vol} kg</div>
                  <div className="text-xs" style={{ color: C.faint }}>volumen</div>
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
