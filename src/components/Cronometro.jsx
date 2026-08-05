import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Minus, Plus, Lightbulb } from "lucide-react";
import { C } from "../data/theme";
import { Ring } from "./ui";

/* ============================================================
   Cronómetro de ejercicio.

   Para los que se miden en tiempo y no en repeticiones: la plancha,
   la sentadilla isométrica, el circuito de abdominales.

   Pensado para usarse con el teléfono apoyado en el suelo y las
   manos ocupadas:

   · Cuenta atrás sonora en los últimos tres segundos, y un aviso
     distinto al llegar a cero. Sabes que viene sin mirar.
   · Mantiene la pantalla encendida mientras corre. Sin esto el
     teléfono se apaga solo a mitad de una plancha de 40 segundos y
     te pierdes el aviso visual.
   · Vibra en Android. En iPhone no: Safari no deja que una página
     haga vibrar el teléfono, y los trucos que existen necesitan un
     toque en pantalla en ese mismo instante, cosa que un reloj que
     llega a cero solo no puede dar. Por eso el aviso principal es
     el sonido y no la vibración.
   · Cuenta con la hora real, no sumando de a un segundo. Si el
     sistema se lleva la pestaña un momento, al volver el tiempo
     está correcto igual.
   ============================================================ */

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`;

export default function Cronometro({ segundos, lane, onCambiarObjetivo, onListo }) {
  const [objetivo, setObjetivo] = useState(segundos);
  const [restante, setRestante] = useState(segundos);
  const [corriendo, setCorriendo] = useState(false);
  const [pantallaViva, setPantallaViva] = useState(false);

  const finEn = useRef(null);
  const sonado = useRef(false);
  const ultimoAviso = useRef(null);
  const audio = useRef(null);
  const wakeLock = useRef(null);

  /* ---------- sonido ----------
     Un solo contexto de audio, creado al tocar "Empezar". En el
     teléfono el navegador solo deja abrirlo a partir de un toque;
     si se creara dentro del temporizador quedaría mudo. */
  const abrirAudio = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audio.current) audio.current = new Ctx();
      if (audio.current.state === "suspended") audio.current.resume();
    } catch {
      /* Sin audio disponible: quedan el color y la pantalla encendida. */
    }
  };

  const pip = (frecuencia, duracion, volumen = 0.3) => {
    const ctx = audio.current;
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frecuencia;
      vol.gain.setValueAtTime(0.0001, t);
      vol.gain.exponentialRampToValueAtTime(volumen, t + 0.015);
      vol.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
      osc.connect(vol).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duracion + 0.02);
    } catch {
      /* nada */
    }
  };

  const avisoFinal = () => {
    [0, 0.18, 0.36].forEach((d) => setTimeout(() => pip(880, 0.15, 0.35), d * 1000));
    navigator.vibrate?.([200, 100, 200]);
  };

  /* ---------- pantalla encendida ---------- */
  const pedirPantalla = async () => {
    try {
      wakeLock.current = await navigator.wakeLock?.request("screen");
      if (wakeLock.current) {
        setPantallaViva(true);
        wakeLock.current.addEventListener?.("release", () => setPantallaViva(false));
      }
    } catch {
      /* El navegador no lo permite o la batería está muy baja. */
    }
  };

  const soltarPantalla = () => {
    wakeLock.current?.release?.().catch(() => {});
    wakeLock.current = null;
    setPantallaViva(false);
  };

  useEffect(() => {
    if (corriendo) pedirPantalla();
    else soltarPantalla();
    return soltarPantalla;
  }, [corriendo]);

  /* El sistema suelta el permiso al pasar la app a segundo plano.
     Al volver, si el reloj sigue andando, se pide de nuevo. */
  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState === "visible" && corriendo && !wakeLock.current) {
        pedirPantalla();
      }
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, [corriendo]);

  /* ---------- el reloj ---------- */
  useEffect(() => {
    setObjetivo(segundos);
    setRestante(segundos);
    setCorriendo(false);
    sonado.current = false;
    ultimoAviso.current = null;
  }, [segundos]);

  useEffect(() => {
    if (!corriendo) return;
    finEn.current = Date.now() + restante * 1000;

    const id = setInterval(() => {
      const quedan = Math.max(0, (finEn.current - Date.now()) / 1000);
      setRestante(quedan);

      /* Cuenta atrás: un pip por segundo en los últimos tres. */
      const seg = Math.ceil(quedan);
      if (quedan > 0 && seg <= 3 && ultimoAviso.current !== seg) {
        ultimoAviso.current = seg;
        pip(620, 0.09, 0.22);
      }

      if (quedan <= 0) {
        setCorriendo(false);
        if (!sonado.current) {
          sonado.current = true;
          avisoFinal();
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
    ultimoAviso.current = null;
    onCambiarObjetivo?.(nuevo);
  };

  const reiniciar = () => {
    setCorriendo(false);
    setRestante(objetivo);
    sonado.current = false;
    ultimoAviso.current = null;
  };

  const terminado = restante <= 0;
  const porUltimos = restante > 0 && restante <= 5;

  const alternar = () => {
    /* El audio se abre acá y no antes: el navegador del teléfono solo
       deja hacerlo a partir de un toque de la persona. */
    abrirAudio();
    if (terminado) reiniciar();
    else setCorriendo((c) => !c);
  };

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
            <button onClick={alternar}
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

      <div className="mt-3 flex items-start gap-2">
        {pantallaViva && (
          <span className="flex items-center gap-1 text-xs font-semibold shrink-0 px-2 py-1 rounded-full"
                style={{ background: lane.soft, color: lane.accent }}>
            <Lightbulb size={11} /> Pantalla encendida
          </span>
        )}
        <p className="text-xs" style={{ color: C.faint }}>
          {terminado
            ? "Tiempo cumplido. Marca la serie cuando estés lista."
            : "Suena en los últimos 3 segundos y al terminar."}
        </p>
      </div>
    </div>
  );
}
