import React, { useState } from "react";
import { KeyRound, Check, ArrowLeft } from "lucide-react";
import { C, CARRIL_ACTIVO } from "../data/theme";
import { cambiarClave, authError } from "../lib/supabase";
import { Logo } from "./Logo";
import { Boton, InputClave } from "./ui";

/* ============================================================
   Poner una contraseña nueva.

   La misma pantalla sirve para los dos caminos: llegar desde el link
   del correo (recuperación) o cambiarla a propósito desde el menú. Lo
   único que cambia es el texto y si hay botón para volver.

   Pide escribirla dos veces: es la única pantalla de la app donde un
   error de tipeo te deja fuera, y con el ojito igual se puede revisar.
   ============================================================ */

export default function NuevaClave({ recuperacion = false, onListo, onCancelar }) {
  const [clave, setClave] = useState("");
  const [repetida, setRepetida] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ok, setOk] = useState(false);

  const lane = CARRIL_ACTIVO;

  const guardar = async () => {
    setMsg(null);
    if (clave.length < 6) return setMsg("La contraseña necesita al menos 6 caracteres.");
    if (clave !== repetida) return setMsg("Las dos contraseñas no son iguales.");

    setBusy(true);
    try {
      await cambiarClave(clave);
      setOk(true);
      /* Un respiro para que alcance a leerse el aviso antes de seguir. */
      setTimeout(() => onListo(), 1500);
    } catch (e) {
      setMsg(authError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-sm px-5 py-10 rise">
        <div className="flex flex-col items-center mb-7">
          <Logo stacked size={32}
                sub={recuperacion ? "Elige tu contraseña nueva" : "Cambiar tu contraseña"} />
        </div>

        {ok ? (
          <div className="rounded-3xl p-6 text-center"
               style={{ background: C.card, border: `1px solid ${C.border}`,
                        boxShadow: "var(--shadow-sm)" }}>
            <span className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(91,217,138,0.14)" }}>
              <Check size={22} strokeWidth={3} style={{ color: C.done }} />
            </span>
            <div className="text-sm font-semibold">Contraseña cambiada</div>
            <p className="text-xs mt-1.5" style={{ color: C.faint }}>
              Anótala en un lugar seguro.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-3xl p-4 mb-3"
                 style={{ background: C.surface2, border: `1px dashed ${C.border}` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <KeyRound size={15} style={{ color: lane.accent }} />
                <span className="text-xs font-semibold">Al menos 6 caracteres</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.faint }}>
                Toca el ojito para revisarla antes de guardar.
              </p>
            </div>

            <div className="space-y-3">
              <InputClave value={clave} onChange={(e) => setClave(e.target.value)}
                          placeholder="Contraseña nueva" autoComplete="new-password"
                          className="w-full" />
              <InputClave value={repetida} onChange={(e) => setRepetida(e.target.value)}
                          placeholder="Escríbela otra vez" autoComplete="new-password"
                          onKeyDown={(e) => e.key === "Enter" && guardar()}
                          className="w-full" />
            </div>

            {msg && (
              <div className="mt-3 px-3.5 py-2.5 rounded-2xl text-xs"
                   style={{ background: "rgba(255,90,90,0.12)", color: C.danger,
                            border: "1px solid rgba(255,90,90,0.25)" }}>
                {msg}
              </div>
            )}

            <div className="mt-5">
              <Boton onClick={guardar} disabled={busy} lane={lane}>
                <KeyRound size={18} strokeWidth={2.5} />
                {busy ? "Guardando…" : "Guardar contraseña"}
              </Boton>
            </div>

            {onCancelar && (
              <button onClick={onCancelar}
                className="w-full mt-3 py-3 rounded-2xl text-sm font-medium
                           flex items-center justify-center gap-1.5"
                style={{ color: C.muted }}>
                <ArrowLeft size={15} /> Volver
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
