import React, { useState } from "react";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Dumbbell, Timer, Play, Repeat,
} from "lucide-react";
import { C } from "../data/theme";
import { PROGRAMS, ORDER, FIXED_REST } from "../data/programs";
import { imagenEjercicio } from "../lib/imagenes";
import { Section, Boton, labelStyle } from "./ui";
import VideoEjercicio, { BotonVideo } from "./VideoEjercicio";

/* ============================================================
   MI PLAN

   Ver el entrenamiento completo sin tener que empezarlo. Antes los
   ejercicios solo aparecían dentro de la sesión en vivo, uno por vez:
   para saber qué venía el viernes había que arrancar el viernes.

   Acá está cada rutina entera, y se pasa de una a otra con las flechas.
   Tocar un ejercicio lo abre: la ilustración grande, el montaje de la
   máquina y el descanso.
   ============================================================ */

/* "4 series × 10 reps", o "× 30 seg" cuando el ejercicio va por tiempo. */
const dosis = (e) => {
  const unidad = e.unit ? e.unit : "reps";
  return `${e.sets} ${e.sets === 1 ? "serie" : "series"} × ${e.reps} ${unidad}`;
};

function Ilustracion({ programa, ejercicio, size = 64, lane, grande }) {
  const src = imagenEjercicio(programa, ejercicio.id);

  /* Chica es un cuadrado fijo al lado del nombre; grande ocupa el ancho
     de la tarjeta y se mantiene cuadrada sola. */
  const caja = grande
    ? { width: "100%", aspectRatio: "1 / 1" }
    : { width: size, height: size };

  if (!src) {
    return (
      <span className="rounded-2xl flex items-center justify-center shrink-0"
            style={{ ...caja, background: lane.soft }}>
        <Dumbbell size={grande ? 56 : size * 0.38}
                  style={{ color: lane.accent, opacity: 0.55 }} />
      </span>
    );
  }

  return (
    <img src={src} alt={ejercicio.name} loading="lazy"
         className="rounded-2xl shrink-0 object-cover"
         style={{ ...caja, background: lane.soft }} />
  );
}

export default function MiPlan({ program, data, lane, videos, onStart, onVolver }) {
  const prog = PROGRAMS[program];
  const rutinas = ORDER[program];

  const [i, setI] = useState(0);
  const [abierto, setAbierto] = useState(null);
  const [viendoVideo, setViendoVideo] = useState(false);

  const k = rutinas[i];
  const dia = prog[k];
  const video = videos?.[k];
  const descansoFijo = FIXED_REST[program];

  const mover = (paso) => {
    /* Da la vuelta: del último se pasa al primero. Son pocas rutinas y
       trabarse en la punta es más molesto que útil. */
    setI((n) => (n + paso + rutinas.length) % rutinas.length);
    setAbierto(null);
    setViendoVideo(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 rise">
      {/* ---- volver ---- */}
      <button onClick={onVolver}
        className="flex items-center gap-1.5 py-2 mb-2 text-sm font-medium"
        style={{ color: C.muted }}>
        <ArrowLeft size={16} /> Volver
      </button>

      {/* ---- qué rutina ---- */}
      <Section raised className="mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => mover(-1)} aria-label="Rutina anterior"
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 active:scale-90"
            style={{ background: C.surface2, color: C.muted, border: `1px solid ${C.border}`,
                     transition: "transform 0.12s ease" }}>
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 min-w-0 text-center px-1">
            <div className="text-xs" style={labelStyle}>{dia.day}</div>
            <div className="display text-2xl leading-none mt-1 truncate">{dia.name}</div>
            <div className="text-xs mt-1.5 truncate" style={{ color: C.muted }}>{dia.focus}</div>
          </div>

          <button onClick={() => mover(1)} aria-label="Rutina siguiente"
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 active:scale-90"
            style={{ background: C.surface2, color: C.muted, border: `1px solid ${C.border}`,
                     transition: "transform 0.12s ease" }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Puntos: en cuál de las rutinas estás. */}
        <div className="flex justify-center gap-1.5 mt-3">
          {rutinas.map((r, n) => (
            <button key={r} onClick={() => { setI(n); setAbierto(null); }}
              aria-label={`Ir a ${prog[r].name}`}
              className="rounded-full"
              style={{
                width: n === i ? 20 : 7, height: 7,
                background: n === i ? lane.accent : C.border,
                transition: "width 0.2s ease, background 0.2s ease",
              }} />
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3.5 justify-center">
          <Etiqueta icon={Dumbbell} texto={`${dia.ex.length} ejercicios`} lane={lane} />
          <Etiqueta icon={Timer} texto={`${dia.mins} min`} lane={lane} />
          {dia.cardio && <Etiqueta icon={Repeat} texto={`${dia.cardio} min cardio`} lane={lane} />}
        </div>

        {video && (
          <div className="mt-3 flex justify-center">
            <BotonVideo lane={lane} onClick={() => setViendoVideo(true)} />
          </div>
        )}
      </Section>

      {/* ---- los ejercicios ---- */}
      <div className="space-y-2">
        {dia.ex.map((e, n) => {
          const on = abierto === n;
          const peso = data.weights[e.id] ?? e.kg ?? 0;
          const descanso = descansoFijo ?? e.rest;

          return (
            <div key={e.id + n} className="rounded-3xl overflow-hidden"
                 style={{ background: C.card, border: `1px solid ${on ? lane.accent : C.border}`,
                          boxShadow: "var(--shadow-sm)" }}>
              <button onClick={() => setAbierto(on ? null : n)}
                className="w-full text-left p-3 flex items-center gap-3">
                <Ilustracion programa={program} ejercicio={e} size={64} lane={lane} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight">{e.name}</div>
                  <div className="text-xs mt-1" style={{ color: C.muted }}>{dosis(e)}</div>
                  {peso > 0 && (
                    <div className="display text-lg leading-none mt-1" style={{ color: lane.accent }}>
                      {peso}<span className="text-xs ml-0.5" style={{ color: C.faint }}>kg</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={17}
                  style={{ color: C.faint, transform: on ? "rotate(90deg)" : "none",
                           transition: "transform 0.2s ease" }} />
              </button>

              {on && (
                <div className="px-3 pb-3">
                  <div className="mb-3">
                    <Ilustracion programa={program} ejercicio={e} lane={lane} grande />
                  </div>
                  <div className="rounded-2xl p-3.5" style={{ background: C.surface2 }}>
                    <div className="text-xs mb-1.5" style={labelStyle}>Cómo se arma</div>
                    <p className="text-xs leading-relaxed" style={{ color: C.text }}>{e.setup}</p>
                    {descanso > 0 && (
                      <div className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color: C.muted }}>
                        <Timer size={12} style={{ color: lane.accent }} />
                        {descanso} seg de descanso entre series
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- empezar ---- */}
      <div className="mt-4">
        <Boton onClick={() => onStart(k)} lane={lane}>
          <Play size={18} strokeWidth={2.5} /> Empezar esta sesión
        </Boton>
      </div>

      {viendoVideo && video && (
        <VideoEjercicio ruta={video.ruta} titulo={dia.name} lane={lane}
                        onCerrar={() => setViendoVideo(false)} />
      )}

      <div className="h-4" />
    </div>
  );
}

function Etiqueta({ icon: Icon, texto, lane }) {
  return (
    <span className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
          style={{ background: lane.soft, color: lane.accent }}>
      <Icon size={12} /> {texto}
    </span>
  );
}
