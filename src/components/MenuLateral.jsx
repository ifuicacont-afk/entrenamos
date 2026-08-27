import React, { useEffect, useState } from "react";
import { X, Clapperboard, LogOut, Palette, ChevronRight, KeyRound, ListChecks } from "lucide-react";
import { C, LANES } from "../data/theme";
import { Logo, Cara } from "./Logo";
import TemaSwitch from "./TemaSwitch";
import ColorSwitch from "./ColorSwitch";
import { labelStyle } from "./ui";

/* ============================================================
   Menú lateral.

   Se lleva lo que no es del día a día: quién eres, cómo se ve la app
   y la biblioteca de videos. Así la barra de abajo queda solo con las
   cuatro pantallas que se usan entrenando, y Progreso deja de ser un
   cajón de sastre con ajustes mezclados entre los gráficos.

   Entra deslizándose desde la derecha, que es de donde viene el
   botón que lo abre. Se cierra con el fondo, con la X o con Escape.
   ============================================================ */

export default function MenuLateral({
  abierto, profile, lane, modoTema, onTema, temaActivo, color, onColor,
  cuantosVideos, onAbrirVideos, onAbrirPlan, onCambiarClave, onSalir, onCerrar,
}) {
  /* Se monta antes de animar, para que la transición se vea. */
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (abierto) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [abierto]);

  /* Con el menú abierto, el fondo no debe desplazarse. */
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const plan = LANES[profile.program] ?? LANES.ignacio;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menú">
      <div
        onClick={onCerrar}
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      />

      <aside
        className="absolute top-0 right-0 h-full w-[86%] max-w-sm overflow-y-auto"
        style={{
          background: C.bg,
          borderLeft: `1px solid ${C.border}`,
          boxShadow: "-18px 0 44px -20px rgba(0,0,0,0.6)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* ---- marca ---- */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between">
          <Logo size={26} />
          <button onClick={onCerrar} aria-label="Cerrar menú"
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.surface2, color: C.muted }}>
            <X size={17} />
          </button>
        </div>

        {/* ---- quién eres ---- */}
        <div className="mx-5 mb-5 rounded-3xl p-4 flex items-center gap-3"
             style={{ background: C.card, border: `1px solid ${C.border}`,
                      boxShadow: "var(--shadow-sm)" }}>
          <Cara quien={profile.program} size={52} anillo={lane.accent} />
          <div className="min-w-0">
            <div className="text-base font-semibold truncate">{profile.name}</div>
            <div className="text-xs truncate" style={{ color: C.faint }}>
              {plan.label} · {plan.detalle}
            </div>
          </div>
        </div>

        {/* ---- mi plan ---- */}
        <div className="px-5 mb-3">
          <button onClick={() => { onCerrar(); onAbrirPlan(); }}
            className="w-full rounded-3xl p-4 flex items-center justify-between active:scale-[0.99]"
            style={{ background: C.card, border: `1px solid ${C.border}`,
                     boxShadow: "var(--shadow-sm)", transition: "transform 0.12s ease" }}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: lane.soft }}>
                <ListChecks size={17} style={{ color: lane.accent }} />
              </span>
              <div className="text-left min-w-0">
                <div className="text-sm font-semibold">Mi plan</div>
                <div className="text-xs" style={{ color: C.faint }}>
                  Todas tus rutinas, ejercicio por ejercicio
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: C.faint }} />
          </button>
        </div>

        {/* ---- videos ---- */}
        <div className="px-5">
          <button onClick={() => { onCerrar(); onAbrirVideos(); }}
            className="w-full rounded-3xl p-4 flex items-center justify-between active:scale-[0.99]"
            style={{ background: C.card, border: `1px solid ${C.border}`,
                     boxShadow: "var(--shadow-sm)", transition: "transform 0.12s ease" }}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: LANES.linda.soft }}>
                <Clapperboard size={17} style={{ color: LANES.linda.accent }} />
              </span>
              <div className="text-left min-w-0">
                <div className="text-sm font-semibold">Videos del plan de Linda</div>
                <div className="text-xs" style={{ color: C.faint }}>
                  {cuantosVideos ? `${cuantosVideos} de 6 rutinas con video` : "Todavía no hay videos"}
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: C.faint }} />
          </button>
        </div>

        {/* ---- apariencia ---- */}
        <div className="px-5 mt-4">
          <div className="rounded-3xl p-4"
               style={{ background: C.card, border: `1px solid ${C.border}`,
                        boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={15} style={{ color: lane.accent }} />
              <span className="text-xs" style={labelStyle}>Apariencia</span>
            </div>

            <TemaSwitch modo={modoTema} onChange={onTema} lane={lane} />
            <p className="text-xs mt-2.5" style={{ color: C.faint }}>
              En <b>Auto</b> la app sigue a tu teléfono: clara de día, oscura de noche.
            </p>

            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
              <div className="text-xs mb-3" style={labelStyle}>Color</div>
              <ColorSwitch color={color} onChange={onColor} tema={temaActivo}
                           program={profile.program} />
              <p className="text-xs mt-3 leading-relaxed" style={{ color: C.faint }}>
                Es tuyo: cambiarlo no afecta cómo ve la app la otra persona. Te acompaña
                aunque entres desde otro teléfono.
              </p>
            </div>
          </div>
        </div>

        {/* ---- cuenta ---- */}
        {onCambiarClave && (
        <div className="px-5 mt-4">
          <button onClick={onCambiarClave}
            className="w-full rounded-3xl p-4 flex items-center justify-between active:scale-[0.99]"
            style={{ background: C.card, border: `1px solid ${C.border}`,
                     boxShadow: "var(--shadow-sm)", transition: "transform 0.12s ease" }}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: lane.soft }}>
                <KeyRound size={17} style={{ color: lane.accent }} />
              </span>
              <div className="text-left min-w-0">
                <div className="text-sm font-semibold">Cambiar contraseña</div>
                <div className="text-xs" style={{ color: C.faint }}>
                  Elige una nueva sin salir de la app
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: C.faint }} />
          </button>
        </div>
        )}

        {/* ---- salir ---- */}
        <div className="px-5 mt-4 mb-6">
          <button onClick={onSalir}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: C.surface2, color: C.muted, border: `1px solid ${C.border}` }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
          <p className="text-xs mt-4 text-center leading-relaxed" style={{ color: C.faint }}>
            Cada cuenta ve solo sus propios datos. Tu entrenamiento, tu peso y tus
            comidas no son visibles para la otra persona.
          </p>
        </div>
      </aside>
    </div>
  );
}
