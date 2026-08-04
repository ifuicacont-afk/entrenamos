import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, Trash2, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { C, LANES } from "../data/theme";
import { PROGRAMS, ORDER } from "../data/programs";
import { listarVideos, subirVideo, borrarVideo, pesoLegible } from "../lib/videos";
import { Section, labelStyle } from "./ui";
import VideoEjercicio from "./VideoEjercicio";

/* ============================================================
   Biblioteca de videos del plan de Linda.

   Los videos son los que mandó su entrenadora. Cualquiera de las dos
   cuentas puede cargarlos —la idea es que Ignacio pueda dejárselos
   listos— y aparecen mientras ella entrena.

   Un ejercicio se repite en varios días de la semana (el peso muerto
   sale el miércoles y el viernes). Como el video es del ejercicio y
   no del día, acá se lista una sola vez cada uno: se sube una vez y
   aparece en todos los días donde toque.
   ============================================================ */

const PROGRAMA = "linda";
const LIMITE_MB = 100;

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
      .then(setVideos)
      .catch(() => setError("No se pudo leer la lista de videos."))
      .finally(() => setCargando(false));
  }, []);

  /* Cada ejercicio una sola vez, aunque se repita en varios días. */
  const ejercicios = (() => {
    const vistos = new Map();
    ORDER[PROGRAMA].forEach((diaId) => {
      PROGRAMS[PROGRAMA][diaId].ex.forEach((e) => {
        if (!vistos.has(e.id)) vistos.set(e.id, { ...e, dias: [] });
        vistos.get(e.id).dias.push(PROGRAMS[PROGRAMA][diaId].day);
      });
    });
    return [...vistos.values()];
  })();

  const elegirArchivo = async (ejercicio, archivo) => {
    if (!archivo) return;
    setError(null);

    if (archivo.size > LIMITE_MB * 1024 * 1024) {
      setError(`"${archivo.name}" pesa ${pesoLegible(archivo.size)}. El máximo es ${LIMITE_MB} MB.`);
      return;
    }

    setSubiendo(ejercicio.id);
    setAvance(0);
    try {
      await subirVideo({
        programa: PROGRAMA,
        ejercicioId: ejercicio.id,
        archivo,
        onAvance: setAvance,
      });
      setVideos(await listarVideos());
    } catch (e) {
      setError(e?.message || "No se pudo subir el video.");
    } finally {
      setSubiendo(null);
      setAvance(0);
    }
  };

  const quitar = async (ejercicio) => {
    setError(null);
    try {
      await borrarVideo(ejercicio.id);
      setVideos((v) => {
        const n = { ...v };
        delete n[ejercicio.id];
        return n;
      });
    } catch {
      setError("No se pudo borrar el video.");
    }
  };

  const conVideo = ejercicios.filter((e) => videos[e.id]).length;
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
            Plan de Linda · {conVideo} de {ejercicios.length} ejercicios
          </div>
        </div>
      </div>

      <Section className="mb-4">
        <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
          Sube acá los videos que mandó la entrenadora. Aparecen con un botón
          <b style={{ color: lane.accent }}> Ver técnica</b> mientras Linda entrena.
        </p>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: C.faint }}>
          Un video por ejercicio, hasta {LIMITE_MB} MB. Hay 1 GB en total y llevas{" "}
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
        <div className="space-y-2">
          {ejercicios.map((e) => {
            const v = videos[e.id];
            const activo = subiendo === e.id;
            return (
              <div key={e.id} className="rounded-2xl p-3.5"
                   style={{
                     background: C.card,
                     border: `1px solid ${v ? lane.accent : C.border}`,
                     boxShadow: "var(--shadow-sm)",
                   }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      {v && <CheckCircle2 size={13} style={{ color: lane.accent, flexShrink: 0 }} />}
                      <span className="truncate">{e.name}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: C.faint }}>
                      {[...new Set(e.dias)].join(" · ")}
                    </div>
                    {v && (
                      <div className="text-xs mt-1 truncate" style={{ color: C.muted }}>
                        {v.nombre} · {pesoLegible(v.peso)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {v && (
                      <>
                        <button onClick={() => setViendo({ ruta: v.ruta, titulo: e.name })}
                                aria-label={`Ver ${e.name}`}
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: lane.soft, color: lane.accent }}>
                          <Play size={14} fill="currentColor" />
                        </button>
                        <button onClick={() => quitar(e)} aria-label={`Borrar video de ${e.name}`}
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: C.surface2, color: C.muted }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    <button onClick={() => inputs.current[e.id]?.click()} disabled={activo}
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
                  ref={(el) => { inputs.current[e.id] = el; }}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  hidden
                  onChange={(ev) => {
                    elegirArchivo(e, ev.target.files?.[0]);
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
