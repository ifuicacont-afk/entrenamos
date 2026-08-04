import React, { useEffect, useState } from "react";
import { X, Play, AlertCircle } from "lucide-react";
import { C } from "../data/theme";
import { urlDeVideo } from "../lib/videos";

/* ============================================================
   Reproductor.

   Se abre encima de la sesión, sin desmontarla: al cerrarlo se
   vuelve exactamente a la serie que se iba contando.

   El enlace se pide recién al abrir, no al cargar la pantalla. Así
   una sesión de siete ejercicios no gasta datos trayendo siete
   videos que quizá nadie mire.
   ============================================================ */

export function BotonVideo({ onClick, lane }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 active:scale-95"
      style={{
        background: lane.soft,
        color: lane.accent,
        border: `1px solid ${lane.accent}`,
        transition: "transform 0.12s ease",
      }}
    >
      <Play size={12} strokeWidth={3} fill="currentColor" />
      Ver técnica
    </button>
  );
}

export default function VideoEjercicio({ ruta, titulo, lane, onCerrar }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    urlDeVideo(ruta)
      .then((u) => vigente && setUrl(u))
      .catch(() => vigente && setError("No se pudo cargar el video. Revisa tu conexión."));
    return () => { vigente = false; };
  }, [ruta]);

  /* Cerrar con la tecla Escape en el computador. */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)" }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3"
             style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <span className="text-sm font-semibold truncate pr-2">{titulo}</span>
          <button onClick={onCerrar} aria-label="Cerrar"
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: C.surface2, color: C.muted }}>
            <X size={16} />
          </button>
        </div>

        {error ? (
          <div className="px-4 py-10 flex flex-col items-center gap-2">
            <AlertCircle size={26} style={{ color: C.warn }} />
            <p className="text-sm text-center" style={{ color: C.muted }}>{error}</p>
          </div>
        ) : url ? (
          <video
            src={url}
            controls
            autoPlay
            playsInline
            loop
            className="w-full"
            style={{ maxHeight: "70vh", background: "#000", display: "block" }}
          />
        ) : (
          <div className="px-4 py-14 text-sm text-center" style={{ color: C.faint }}>
            Cargando video…
          </div>
        )}

        <p className="px-4 py-3 text-xs" style={{ color: C.faint }}>
          Se repite solo. Ciérralo y sigues justo donde ibas.
        </p>
      </div>
    </div>
  );
}
