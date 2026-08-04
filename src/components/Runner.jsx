import React, { useState, useEffect, useRef } from "react";
import { X, Check, ChevronRight, Timer } from "lucide-react";
import { C } from "../data/theme";
import { PROGRAMS, FIXED_REST } from "../data/programs";
import { Stepper, Stat, labelStyle } from "./ui";

export default function Runner({ program, data, active, lane, onUpdate, onFinish, onQuit }) {
  const day = PROGRAMS[program][active.dayId];
  const ex = day.ex[active.i];
  const restFor = FIXED_REST[program] ?? ex.rest ?? 60;

  const [kg, setKg] = useState(data.weights[ex.id] ?? ex.kg ?? 0);
  const [reps, setReps] = useState(ex.reps);
  const [rest, setRest] = useState(0);
  const [done, setDone] = useState(false);
  const tick = useRef(null);

  useEffect(() => {
    setKg(data.weights[ex.id] ?? ex.kg ?? 0);
    setReps(ex.reps);
    setRest(0);
  }, [active.i, active.dayId]);

  useEffect(() => {
    if (rest <= 0) return;
    tick.current = setInterval(() => setRest((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(tick.current);
  }, [rest > 0]);

  const logged = active.logged[active.i];
  const left = ex.sets - logged.length;

  const logSet = () => {
    const next = active.logged.map((a, i) => (i === active.i ? [...a, { kg, reps }] : a));
    onUpdate({ active: { ...active, logged: next } }, { exerciseId: ex.id, kg });
    if (logged.length + 1 < ex.sets && restFor > 0) setRest(restFor);
  };

  const nextEx = () => {
    if (active.i + 1 < day.ex.length) onUpdate({ active: { ...active, i: active.i + 1 } });
    else setDone(true);
  };

  if (done) {
    const totalSets = active.logged.reduce((a, b) => a + b.length, 0);
    const volume = active.logged.flat().reduce((a, s) => a + s.kg * s.reps, 0);
    return (
      <div className="px-4 pt-6">
        <div className="rounded-3xl p-6 text-center"
             style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
               style={{ background: lane.soft }}>
            <Check size={26} style={{ color: lane.accent }} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Barlow Condensed" }}>SESIÓN TERMINADA</h2>
          <p className="text-sm mt-1" style={{ color: C.muted }}>{day.name}</p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Stat text="Series" value={totalSets} lane={lane} />
            <Stat text="Volumen total" value={`${volume} kg`} lane={lane} />
          </div>

          {day.cardio && (
            <div className="mt-4 p-3 rounded-2xl flex items-center gap-2 justify-center"
                 style={{ background: lane.soft }}>
              <Timer size={16} style={{ color: lane.accent }} />
              <span className="text-sm font-medium" style={{ color: lane.accent }}>
                Ahora {day.cardio} minutos de cardio
              </span>
            </div>
          )}

          <button onClick={onFinish} className="w-full mt-6 py-4 rounded-2xl text-base font-bold"
                  style={{ background: lane.accent, color: C.bg }}>
            Guardar y cerrar
          </button>
        </div>
      </div>
    );
  }

  const pct = ((active.i + logged.length / ex.sets) / day.ex.length) * 100;

  return (
    <div className="px-4">
      <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: C.surface2 }}>
        <div className="h-full transition-all duration-300"
             style={{ width: `${pct}%`, background: lane.accent }} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="text-xs uppercase tracking-widest" style={labelStyle}>
          Ejercicio {active.i + 1} de {day.ex.length}
        </span>
        <button onClick={onQuit} className="p-1.5 rounded-lg" style={{ color: C.faint }} aria-label="Salir">
          <X size={18} />
        </button>
      </div>

      <h2 className="text-4xl font-bold leading-none" style={{ fontFamily: "Barlow Condensed" }}>
        {ex.name.toUpperCase()}
      </h2>
      <p className="text-sm mt-2 leading-relaxed" style={{ color: C.muted }}>{ex.setup}</p>

      {rest > 0 && (
        <div className="mt-5 p-4 rounded-2xl flex items-center justify-between"
             style={{ background: lane.soft, border: `1px solid ${lane.accent}` }}>
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ ...labelStyle, color: lane.accent }}>
              Descanso
            </div>
            <div className="text-3xl font-bold leading-none mt-0.5"
                 style={{ fontFamily: "Barlow Condensed", color: lane.accent }}>
              {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}
            </div>
          </div>
          <button onClick={() => setRest(0)} className="text-sm font-semibold px-3 py-2 rounded-xl"
                  style={{ color: lane.accent }}>
            Saltar
          </button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {!ex.cardio && (
          <Stepper text="Peso" value={kg} unit="kg" step={kg >= 20 ? 2 : 1} min={0}
                   onChange={setKg} lane={lane} />
        )}
        <div className={ex.cardio ? "col-span-2" : ""}>
          <Stepper text={ex.cardio ? "Duración" : ex.unit === "seg" ? "Tiempo" : "Reps"}
                   value={reps} unit={ex.unit || "reps"} step={ex.unit === "seg" ? 5 : 1}
                   min={1} onChange={setReps} lane={lane} />
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-widest mb-2" style={labelStyle}>
          Series · objetivo {ex.sets} × {ex.reps}{ex.unit ? ` ${ex.unit}` : ""}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: ex.sets }).map((_, i) => {
            const s = logged[i];
            return (
              <div key={i} className="flex-1 rounded-xl py-3 text-center"
                   style={{ background: s ? lane.soft : C.surface,
                            border: `1px solid ${s ? lane.accent : C.border}` }}>
                {s ? (
                  <>
                    <div className="text-lg font-bold leading-none"
                         style={{ fontFamily: "Barlow Condensed", color: lane.accent }}>{s.reps}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.muted }}>{s.kg} kg</div>
                  </>
                ) : (
                  <div className="text-lg font-bold leading-none"
                       style={{ fontFamily: "Barlow Condensed", color: C.faint }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {left > 0 ? (
          <button onClick={logSet} className="w-full py-4 rounded-2xl text-base font-bold"
                  style={{ background: lane.accent, color: C.bg }}>
            Serie lista
          </button>
        ) : (
          <button onClick={nextEx}
            className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
            style={{ background: lane.accent, color: C.bg }}>
            {active.i + 1 < day.ex.length ? "Siguiente ejercicio" : "Terminar sesión"}
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        )}
        {left > 0 && (
          <button onClick={nextEx} className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{ color: C.muted, background: C.surface, border: `1px solid ${C.border}` }}>
            Saltar ejercicio
          </button>
        )}
      </div>

      <p className="text-xs mt-5 leading-relaxed" style={{ color: C.faint }}>
        {program === "linda"
          ? "Descanso de 40 segundos entre series. Si no llegas a las repeticiones con buena técnica, baja el peso."
          : "Termina cada serie sintiendo que te quedaban 3 repeticiones. Si te sobran 4 o más, sube el peso la próxima vez."}
      </p>
    </div>
  );
}
