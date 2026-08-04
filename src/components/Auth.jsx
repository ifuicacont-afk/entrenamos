import React, { useState } from "react";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { C, LANES } from "../data/theme";
import { signIn, signUp, authError } from "../lib/supabase";
import { Logo } from "./Logo";
import { Levanta } from "./Illustration";
import { Boton, Input } from "./ui";

/* Código para poder crear una cuenta. Se define en .env (y en Vercel) como
   VITE_CODIGO_INVITACION. Si queda vacío, el registro es libre. */
const CODIGO = (import.meta.env.VITE_CODIGO_INVITACION || "").trim();

export default function Auth() {
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [codigo, setCodigo] = useState("");
  const [program, setProgram] = useState("ignacio");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ok, setOk] = useState(null);

  const lane = LANES[program];
  const isUp = mode === "up";

  const submit = async () => {
    setMsg(null);
    setOk(null);
    if (!email || !password) return setMsg("Falta el correo o la contraseña.");
    if (isUp && password.length < 6) return setMsg("La contraseña necesita al menos 6 caracteres.");
    if (isUp && !name.trim()) return setMsg("Escribe tu nombre.");
    if (isUp && CODIGO && codigo.trim() !== CODIGO)
      return setMsg("El código de invitación no es correcto.");

    setBusy(true);
    try {
      if (isUp) {
        await signUp({ email, password, name: name.trim(), program });
        setOk("Cuenta creada. Ya puedes entrar con tu correo y contraseña.");
        setMode("in");
      } else {
        await signIn({ email, password });
      }
    } catch (e) {
      setMsg(authError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-sm px-5 py-10 rise">
        {/* ---- marca ---- */}
        <div className="flex flex-col items-center mb-7">
          {!isUp && (
            <div className="mb-1">
              <Levanta size={132} />
            </div>
          )}
          <Logo stacked size={40} sub={isUp ? "Crea tu cuenta para empezar" : "Entrenamiento y alimentación"} />
        </div>

        <div className="space-y-3">
          {isUp && (
            <>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                     placeholder="Tu nombre" autoComplete="name" className="w-full" />

              <div>
                <div className="text-xs mb-2 px-1"
                     style={{ color: C.faint, fontFamily: "Barlow Condensed",
                              letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Tu plan
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["ignacio", "linda"].map((k) => {
                    const on = program === k;
                    const l = LANES[k];
                    return (
                      <button key={k} onClick={() => setProgram(k)} type="button"
                        className="py-4 px-3 rounded-2xl text-sm font-semibold text-left active:scale-[0.98]"
                        style={{
                          background: on ? l.soft : C.surface,
                          color: on ? l.accent : C.muted,
                          border: `1.5px solid ${on ? l.accent : C.border}`,
                          boxShadow: on ? `0 8px 20px -12px ${l.glow}` : "none",
                          transition: "transform 0.12s ease",
                        }}>
                        <span className="block w-6 h-6 rounded-lg mb-2"
                              style={{ background: on ? l.accent : C.surface2 }} />
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <Input value={email} onChange={(e) => setEmail(e.target.value.trim())}
                 type="email" placeholder="Correo" autoComplete="email" inputMode="email"
                 className="w-full" />

          <Input value={password} onChange={(e) => setPassword(e.target.value)}
                 type="password" placeholder="Contraseña"
                 autoComplete={isUp ? "new-password" : "current-password"}
                 onKeyDown={(e) => e.key === "Enter" && submit()}
                 className="w-full" />

          {isUp && CODIGO && (
            <div className="rounded-2xl p-3.5"
                 style={{ background: C.surface2, border: `1px dashed ${C.border}` }}>
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldCheck size={15} style={{ color: lane.accent }} />
                <span className="text-xs font-semibold" style={{ color: C.text }}>
                  Esta app es privada
                </span>
              </div>
              <Input value={codigo} onChange={(e) => setCodigo(e.target.value)}
                     placeholder="Código de invitación" autoComplete="off"
                     onKeyDown={(e) => e.key === "Enter" && submit()}
                     className="w-full" style={{ background: C.surface }} />
              <p className="text-xs mt-2" style={{ color: C.faint }}>
                Sin el código no se puede crear una cuenta.
              </p>
            </div>
          )}
        </div>

        {msg && (
          <div className="mt-3 px-3.5 py-2.5 rounded-2xl text-xs"
               style={{ background: "rgba(255,90,90,0.12)", color: C.danger,
                        border: "1px solid rgba(255,90,90,0.25)" }}>
            {msg}
          </div>
        )}
        {ok && (
          <div className="mt-3 px-3.5 py-2.5 rounded-2xl text-xs"
               style={{ background: "rgba(91,217,138,0.12)", color: C.done,
                        border: "1px solid rgba(91,217,138,0.25)" }}>
            {ok}
          </div>
        )}

        <div className="mt-5">
          <Boton onClick={submit} disabled={busy} lane={lane}>
            {isUp ? <UserPlus size={18} strokeWidth={2.5} /> : <LogIn size={18} strokeWidth={2.5} />}
            {busy ? "Un momento…" : isUp ? "Crear cuenta" : "Entrar"}
          </Boton>
        </div>

        <button onClick={() => { setMode(isUp ? "in" : "up"); setMsg(null); setOk(null); }}
          className="w-full mt-3 py-3 rounded-2xl text-sm font-medium"
          style={{ color: C.muted }}>
          {isUp ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
        </button>

        <p className="text-xs mt-7 text-center leading-relaxed" style={{ color: C.faint }}>
          Cada cuenta ve solo sus propios datos. Tu entrenamiento, tu peso y tus comidas
          no son visibles para la otra persona.
        </p>
      </div>
    </div>
  );
}
