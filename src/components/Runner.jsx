import React, { useState, useEffect, useRef } from "react";
import { X, Check, ChevronRight, Timer } from "lucide-react";
import { C } from "../data/theme";
import { PROGRAMS, FIXED_REST } from "../data/programs";
import { Stepper, Stat, Ring, Boton, Section, labelStyle } from "./ui";
import { Cima } from "./Illustration";
import { Personaje } from "./Logo";
import VideoEjercicio, { BotonVideo } from "./VideoEjercicio";

export default function Runner({ program, data, active, lane, videos, onUpdate, onFinish, onQuit }) {
  const day = PROGRAMS[program][active.dayId];
  const ex = day.ex[active.i];
  const restFor = FIXED_REST[program] ?? ex.rest ?? 60;
  const video = videos?.[active.dayId];

  const [kg, setKg] = useState(data.weights[ex.id] ?? ex.kg ?? 0);
  const [reps, setReps] = useState(ex.reps);
  const [rest, setRest] = useState(0);
  const [done, setDone] = useState(false);
  const [viendo, setViendo] = useState(false);
  const tick = useRef(null);

  useEffect(() => {
    setKg(data.weights[ex.id] ?? ex.kg ?? 0);
    setReps(ex.reps);
    setRest(0);
    setViendo(false);
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

  /* ---------- pantalla final ---------- */
  if (done) {
    const totalSets = active.logged.reduce((a, b) => a + b.length, 0);
    const volume = active.logged.flat().reduce((a, s) => a + s.kg * s.reps, 0);
    return (
      <div className="px-4 pt-4 rise">
        <Section raised className="text-center p-6">
          <div className="flex justify-center items-end gap-1 mb-3">
            <Personaje quien={program} size={150} />
            <span style={{ marginBottom: 6 }}><Cima size={72} /></span>
          </div>
          <h2 className="display text-3xl leading-none">SESIÓN TERMINADA</h2>
          <p className="text-sm mt-2" style={{ color: C.muted }}>{day.name}</p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Stat text="Series completadas" value={totalSets} lane={lane} />
            <Stat text="Kilos movidos" value={volume.toLocaleString("es-CL")} lane={lane} />
          </div>

          {day.cardio && (
            <div className="mt-4 p-3.5 rounded-2xl flex items-center gap-2 justify-center"
                 style={{ background: lane.soft, border: `1px solid ${lane.accent}` }}>
              <Timer size={16} style={{ color: lane.accent }} />
              <span className="text-sm font-semibold" style={{ color: lane.accent }}>
                Ahora {day.cardio} minutos de cardio
              </span>
            </div>
          )}

          <div className="mt-6">
            <Boton onClick={onFinish} lane={lane}>Guardar y cerrar</Boton>
          </div>
        </Section>
        <div className="h-4" />
      </div>
    );
  }

  /* ---------- ejercicio en curso ---------- */
  const pct = ((active.i + logged.length / ex.sets) / day.ex.length) * 100;
  const mm = Math.floor(rest / 60);
  const ss = String(rest % 60).padStart(2, "0");

  return (
    <div className="px-4 rise">
      {/* avance de la sesión */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.ringTrack }}>
          <div className="h-full rounded-full"
               style={{
                 width: `${pct}%`,
                 background: `linear-gradient(90deg, ${lane.accent}, ${C.brand})`,
                 transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)",
               }} />
        </div>
        <button onClick={onQuit} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: C.surface2, color: C.muted, border: `1px solid ${C.border}` }}
                aria-label="Salir">
          <X size={17} />
        </button>
      </div>

      <div className="text-xs mb-1.5" style={labelStyle}>
        Ejercicio {active.i + 1} de {day.ex.length}
      </div>
      <h2 className="display text-4xl leading-none">{ex.name.toUpperCase()}</h2>
      <p className="text-sm mt-2 leading-relaxed" style={{ color: C.muted }}>{ex.setup}</p>

      {/* El video es de la rutina completa, así que está disponible en
          todos los ejercicios de la sesión, no solo en el primero. */}
      {video && (
        <div className="mt-3">
          <BotonVideo lane={lane} onClick={() => setViendo(true)} />
        </div>
      )}

      {viendo && video && (
        <VideoEjercicio ruta={video.ruta} titulo={day.name} lane={lane}
                        onCerrar={() => setViendo(false)} />
      )}

      {/* descanso */}
      {rest > 0 && (
        <Section raised className="mt-4 flex items-center gap-4">
          <Ring pct={(rest / restFor) * 100} size={86} grosor={8} color={lane.accent} animar={false}>
            <span className="display text-2xl leading-none" style={{ color: lane.accent }}>
              {mm}:{ss}
            </span>
          </Ring>
          <div className="flex-1">
            <div className="text-xs" style={{ ...labelStyle, color: lane.accent }}>Descanso</div>
            <p className="text-xs mt-1.5" style={{ color: C.muted }}>
              Respira. La serie siguiente sale mejor si esperas.
            </p>
            <button onClick={() => setRest(0)}
                    className="mt-2.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: lane.soft, color: lane.accent }}>
              Saltar descanso
            </button>
          </div>
        </Section>
      )}

      {/* peso y repeticiones */}
      <div className="mt-4 grid grid-cols-2 gap-3">
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

      {/* series */}
      <div className="mt-5">
        <div className="text-xs mb-2" style={labelStyle}>
          Series · objetivo {ex.sets} × {ex.reps}{ex.unit ? ` ${ex.unit}` : ""}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: ex.sets }).map((_, i) => {
            const s = logged[i];
            return (
              <div key={i} className="flex-1 rounded-2xl py-3 text-center"
                   style={{
                     background: s ? lane.soft : C.surface,
                     border: `1px solid ${s ? lane.accent : C.border}`,
                     boxShadow: s ? `0 6px 16px -12px ${lane.glow}` : "none",
                   }}>
                {s ? (
                  <>
                    <div className="display text-xl leading-none" style={{ color: lane.accent }}>
                      {s.reps}
                    </div>
                    <div className="text-xs mt-1" style={{ color: C.muted }}>{s.kg} kg</div>
                  </>
                ) : (
                  <div className="display text-xl leading-none" style={{ color: C.faint }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {left > 0 ? (
          <Boton onClick={logSet} lane={lane}>
            <Check size={18} strokeWidth={3} />
            Serie lista
          </Boton>
        ) : (
          <Boton onClick={nextEx} lane={lane}>
            {active.i + 1 < day.ex.length ? "Siguiente ejercicio" : "Terminar sesión"}
            <ChevronRight size={18} strokeWidth={2.5} />
          </Boton>
        )}
        {left > 0 && (
          <Boton onClick={nextEx} lane={lane} variante="fantasma" className="!py-3 !text-sm">
            Saltar ejercicio
          </Boton>
        )}
      </div>

      <p className="text-xs mt-5 leading-relaxed" style={{ color: C.faint }}>
        {program === "linda"
          ? "Descanso de 40 segundos entre series. Si no llegas a las repeticiones con buena técnica, baja el peso."
          : "Termina cada serie sintiendo que te quedaban 3 repeticiones. Si te sobran 4 o más, sube el peso la próxima vez."}
      </p>

      <div className="h-4" />
    </div>
  );
}
