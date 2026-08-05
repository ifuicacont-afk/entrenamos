import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, Trash2, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { C, LANES } from "../data/theme";
import { PROGRAMS, ORDER, ABS_DAYS } from "../data/programs";
import { listarVideos, subirVideo, borrarVideo, pesoLegible } from "../lib/videos";
import { Section } from "./ui";
import VideoEjercicio from "./VideoEjercicio";

/* ============================================================
   Biblioteca de videos del plan de Linda.

   Un video por rutina, seis en total: la entrenadora grabó el día
   completo, no ejercicio por ejercicio.

   El complemento de abdominales es el caso raro: en el programa
   figura con el sábado, pero se hace martes, jueves y sábado. Acá se
   muestran los tres días para que no parezca que falta algo.
   ============================================================ */

const PROGRAMA = "linda";
const LIMITE_MB = 100;
const NOMBRE_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Videos({ onVolver }) {
  const [videos, setVideos] = useState({});
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(null);
  const [avance, setAvance] = useState(0);
  const [error, setError] = useState(null);
  const [viendo, setViendo] = useState(null);
  const inputs = useRef({});

  const lane = LANES[PROGRAMA];

  useEffect(() => {
    listarVideos()
      .then((v) => setVideos(v[PROGRAMA] || {}))
      .catch(() => setError("No se pudo leer la lista de videos."))
      .finally(() => setCargando(false));
  }, []);

  const rutinas = ORDER[PROGRAMA].map((id) => {
    const d = PROGRAMS[PROGRAMA][id];
    return {
      id,
      nombre: d.name,
      foco: d.focus,
      ejercicios: d.ex.length,
      /* El de abdominales se hace tres días, no solo el que dice. */
      cuando: id === "ABD" ? ABS_DAYS.map((n) => NOMBRE_DIA[n]).join(" · ") : d.day,
    };
  });

  const elegirArchivo = async (rutina, archivo) => {
    if (!archivo) return;
    setError(null);

    if (archivo.size > LIMITE_MB * 1024 * 1024) {
      setError(`"${archivo.name}" pesa ${pesoLegible(archivo.size)}. El máximo es ${LIMITE_MB} MB.`);
      return;
    }

    setSubiendo(rutina.id);
    setAvance(0);
    try {
      await subirVideo({ programa: PROGRAMA, diaId: rutina.id, archivo, onAvance: setAvance });
      setVideos((await listarVideos())[PROGRAMA] || {});
    } catch (e) {
      setError(e?.message || "No se pudo subir el video.");
    } finally {
      setSubiendo(null);
      setAvance(0);
    }
  };

  const quitar = async (rutina) => {
    setError(null);
    try {
      await borrarVideo(PROGRAMA, rutina.id);
      setVideos((v) => {
        const n = { ...v };
        delete n[rutina.id];
        return n;
      });
    } catch {
      setError("No se pudo borrar el video.");
    }
  };

  const listos = rutinas.filter((r) => videos[r.id]).length;
  const espacio = Object.values(videos).reduce((a, v) => a + (v.peso || 0), 0);

  return (
    <div className="px-4 rise">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onVolver} aria-label="Volver"
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: C.surface2, color: C.muted, border: `1px solid ${C.border}` }}>
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0">
          <div className="display text-2xl leading-none">VIDEOS</div>
          <div className="text-xs mt-0.5" style={{ color: C.faint }}>
            Plan de Linda · {listos} de {rutinas.length} rutinas
          </div>
        </div>
      </div>

      <Section className="mb-4">
        <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
          Un video por rutina. Aparece mientras Linda entrena ese día, con el botón
          <b style={{ color: lane.accent }}> Ver el video</b>, y puede seguir marcando
          sus series con el video abierto o cerrado.
        </p>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: C.faint }}>
          Hasta {LIMITE_MB} MB cada uno. Hay 1 GB en total y llevas{" "}
          {espacio ? pesoLegible(espacio) : "0 KB"}.
        </p>
      </Section>

      {error && (
        <div className="mb-4 px-3.5 py-2.5 rounded-2xl text-xs flex items-start gap-2"
             style={{ background: "rgba(255,90,90,0.12)", color: C.danger,
                      border: "1px solid rgba(255,90,90,0.25)" }}>
          <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <p className="text-sm text-center py-8" style={{ color: C.faint }}>Cargando…</p>
      ) : (
        <div className="space-y-2.5">
          {rutinas.map((r) => {
            const v = videos[r.id];
            const activo = subiendo === r.id;
            return (
              <div key={r.id} className="rounded-2xl p-4"
                   style={{
                     background: C.card,
                     border: `1px solid ${v ? lane.accent : C.border}`,
                     boxShadow: "var(--shadow-sm)",
                   }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold mb-0.5" style={{ color: lane.accent }}>
                      {r.cuando}
                    </div>
                    <div className="text-base font-semibold flex items-center gap-1.5">
                      {v && <CheckCircle2 size={14} style={{ color: lane.accent, flexShrink: 0 }} />}
                      <span className="truncate">{r.nombre}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: C.faint }}>
                      {r.foco} · {r.ejercicios} ejercicios
                    </div>
                    {v && (
                      <div className="text-xs mt-1.5 truncate" style={{ color: C.muted }}>
                        {v.nombre} · {pesoLegible(v.peso)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {v && (
                      <>
                        <button onClick={() => setViendo({ ruta: v.ruta, titulo: r.nombre })}
                                aria-label={`Ver ${r.nombre}`}
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: lane.soft, color: lane.accent }}>
                          <Play size={14} fill="currentColor" />
                        </button>
                        <button onClick={() => quitar(r)} aria-label={`Borrar video de ${r.nombre}`}
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: C.surface2, color: C.muted }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    <button onClick={() => inputs.current[r.id]?.click()} disabled={activo}
                            className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold disabled:opacity-60"
                            style={{ background: v ? C.surface2 : lane.accent, color: v ? C.muted : "#fff" }}>
                      <Upload size={13} />
                      {activo ? `${avance}%` : v ? "Cambiar" : "Subir"}
                    </button>
                  </div>
                </div>

                {activo && (
                  <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: C.ringTrack }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${avance}%`, background: lane.accent, transition: "width 0.2s" }} />
                  </div>
                )}

                <input
                  ref={(el) => { inputs.current[r.id] = el; }}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  hidden
                  onChange={(ev) => {
                    elegirArchivo(r, ev.target.files?.[0]);
                    ev.target.value = "";
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {viendo && (
        <VideoEjercicio ruta={viendo.ruta} titulo={viendo.titulo} lane={lane}
                        onCerrar={() => setViendo(null)} />
      )}

      <div className="h-4" />
    </div>
  );
}
