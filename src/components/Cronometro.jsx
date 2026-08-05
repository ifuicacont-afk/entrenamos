import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";
import { C } from "../data/theme";
import { Ring } from "./ui";

/* ============================================================
   Cronómetro de ejercicio.

   Para los que se miden en tiempo y no en repeticiones: la plancha,
   la sentadilla isométrica, el circuito de abdominales.

   Detalles que importan cuando lo usas con el teléfono apoyado en el
   suelo y las manos ocupadas:

   · Al terminar suena y vibra. No hay que estar mirando la pantalla.
   · Cuenta con la hora real, no sumando de a un segundo. Si el
     teléfono apaga la pantalla o el navegador deja la pestaña de
     lado, al volver el tiempo está correcto igual.
   · Los últimos cinco segundos se ponen en rojo.
   ============================================================ */

/* Un pitido corto generado en el momento. Evita cargar un archivo de
   sonido solo para esto. */
function pitar() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const ahora = ctx.currentTime;

    [0, 0.18, 0.36].forEach((desfase) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      vol.gain.setValueAtTime(0.0001, ahora + desfase);
      vol.gain.exponentialRampToValueAtTime(0.35, ahora + desfase + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, ahora + desfase + 0.15);
      osc.connect(vol).connect(ctx.destination);
      osc.start(ahora + desfase);
      osc.stop(ahora + desfase + 0.16);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    /* Sin permiso de audio: queda la vibración y el color. */
  }
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`;

export default function Cronometro({ segundos, lane, onCambiarObjetivo, onListo }) {
  const [objetivo, setObjetivo] = useState(segundos);
  const [restante, setRestante] = useState(segundos);
  const [corriendo, setCorriendo] = useState(false);
  const finEn = useRef(null);
  const sonado = useRef(false);

  /* Si cambia el ejercicio, el cronómetro se reinicia con su tiempo. */
  useEffect(() => {
    setObjetivo(segundos);
    setRestante(segundos);
    setCorriendo(false);
    sonado.current = false;
  }, [segundos]);

  useEffect(() => {
    if (!corriendo) return;
    finEn.current = Date.now() + restante * 1000;

    const id = setInterval(() => {
      const quedan = Math.max(0, (finEn.current - Date.now()) / 1000);
      setRestante(quedan);
      if (quedan <= 0) {
        setCorriendo(false);
        if (!sonado.current) {
          sonado.current = true;
          pitar();
          navigator.vibrate?.([200, 100, 200]);
          onListo?.();
        }
      }
    }, 100);

    return () => clearInterval(id);
  }, [corriendo]);

  const ajustar = (delta) => {
    const nuevo = Math.max(5, Math.min(600, objetivo + delta));
    setObjetivo(nuevo);
    setRestante(nuevo);
    sonado.current = false;
    onCambiarObjetivo?.(nuevo);
  };

  const reiniciar = () => {
    setCorriendo(false);
    setRestante(objetivo);
    sonado.current = false;
  };

  const terminado = restante <= 0;
  const porUltimos = restante > 0 && restante <= 5;
  const color = terminado ? C.done : porUltimos ? C.danger : lane.accent;
  const pct = objetivo ? (restante / objetivo) * 100 : 0;

  const btn = {
    background: C.surface2,
    color: C.text,
    border: `1px solid ${C.border}`,
    transition: "transform 0.12s ease",
  };

  return (
    <div className="rounded-3xl p-4"
         style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center gap-4">
        <Ring pct={pct} size={104} grosor={9} color={color} animar={false}>
          <span className="display text-3xl leading-none" style={{ color }}>
            {mmss(restante)}
          </span>
          {terminado && (
            <span className="text-xs font-bold" style={{ color: C.done }}>listo</span>
          )}
        </Ring>

        <div className="flex-1 min-w-0">
          {/* Ajuste del tiempo. Solo con el reloj detenido, para no
              cambiarlo sin querer en plena plancha. */}
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => ajustar(-5)} disabled={corriendo} aria-label="Cinco segundos menos"
                    className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95"
                    style={btn}>
              <Minus size={15} strokeWidth={2.5} />
            </button>
            <div className="text-center flex-1">
              <div className="text-sm font-bold" style={{ color: C.text }}>{objetivo}s</div>
              <div className="text-xs" style={{ color: C.faint }}>objetivo</div>
            </div>
            <button onClick={() => ajustar(5)} disabled={corriendo} aria-label="Cinco segundos más"
                    className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95"
                    style={btn}>
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (terminado) reiniciar();
                else setCorriendo((c) => !c);
              }}
              className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-1.5 text-sm font-bold active:scale-95"
              style={{
                background: lane.accent,
                color: "#fff",
                boxShadow: `0 8px 18px -10px ${lane.glow}`,
                transition: "transform 0.12s ease",
              }}
            >
              {terminado ? (
                <><RotateCcw size={15} strokeWidth={2.5} /> Otra vez</>
              ) : corriendo ? (
                <><Pause size={15} strokeWidth={2.5} fill="currentColor" /> Pausar</>
              ) : (
                <><Play size={15} strokeWidth={2.5} fill="currentColor" /> Empezar</>
              )}
            </button>
            {!terminado && restante !== objetivo && (
              <button onClick={reiniciar} aria-label="Reiniciar"
                      className="w-11 h-11 rounded-2xl flex items-center justify-center active:scale-95"
                      style={btn}>
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs mt-3" style={{ color: C.faint }}>
        {terminado
          ? "Tiempo cumplido. Marca la serie cuando estés lista."
          : "Suena y vibra al terminar, así no tienes que mirar la pantalla."}
      </p>
    </div>
  );
}
