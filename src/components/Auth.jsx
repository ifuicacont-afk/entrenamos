import React, { useState } from "react";
import { LogIn, UserPlus, ShieldCheck, Check, Mail, ArrowLeft } from "lucide-react";
import { C, LANES, ORDEN_CARRILES } from "../data/theme";
import { signIn, signUp, pedirRecuperacion, authError } from "../lib/supabase";
import { Logo, Cara } from "./Logo";
import { Boton, Input, InputClave } from "./ui";

/* Código para poder crear una cuenta. Se define en .env (y en Vercel) como
   VITE_CODIGO_INVITACION. Si queda vacío, el registro es libre. */
const CODIGO = (import.meta.env.VITE_CODIGO_INVITACION || "").trim();

export default function Auth() {
  /* Tres pantallas en una: entrar ("in"), crear cuenta ("up") y
     recuperar la contraseña ("olvide"). */
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [codigo, setCodigo] = useState("");
  /* Sin plan elegido de partida: obliga a marcarlo a propósito y
     evita que alguien cree su cuenta con el plan del otro por descuido. */
  const [program, setProgram] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ok, setOk] = useState(null);

  const lane = LANES[program] ?? LANES.ignacio;
  const isUp = mode === "up";
  const isOlvide = mode === "olvide";

  const ir = (m) => { setMode(m); setMsg(null); setOk(null); };

  const submit = async () => {
    setMsg(null);
    setOk(null);

    if (isOlvide) {
      if (!email) return setMsg("Escribe tu correo.");
    } else {
      if (!email || !password) return setMsg("Falta el correo o la contraseña.");
      if (isUp && password.length < 6) return setMsg("La contraseña necesita al menos 6 caracteres.");
      if (isUp && !name.trim()) return setMsg("Escribe tu nombre.");
      if (isUp && !program) return setMsg("Elige tu plan: el de Linda o el de Ignacio.");
      if (isUp && CODIGO && codigo.trim() !== CODIGO)
        return setMsg("El código de invitación no es correcto.");
    }

    setBusy(true);
    try {
      if (isOlvide) {
        await pedirRecuperacion(email);
        /* A propósito no dice si el correo tiene cuenta o no: si lo dijera,
           cualquiera podría usar esta pantalla para averiguarlo. */
        setOk("Si ese correo tiene una cuenta, te llegó un link para poner una " +
              "contraseña nueva. Revisa también el correo no deseado.");
      } else if (isUp) {
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

  const subtitulo = isOlvide
    ? "Recupera tu contraseña"
    : isUp
      ? "Crea tu cuenta para empezar"
      : "Entrenamiento y alimentación";

  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-sm px-5 py-10 rise">
        {/* ---- marca ---- */}
        <div className="flex flex-col items-center mb-7">
          <Logo stacked size={isUp || isOlvide ? 32 : 40} sub={subtitulo} />
        </div>

        <div className="space-y-3">
          {isOlvide && (
            <div className="rounded-3xl p-4"
                 style={{ background: C.surface2, border: `1px dashed ${C.border}` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Mail size={15} style={{ color: lane.accent }} />
                <span className="text-xs font-semibold">Te mandamos un link</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.faint }}>
                Escribe el correo con el que creaste tu cuenta. Al abrir el link
                desde este mismo teléfono, la app te deja poner una contraseña nueva.
              </p>
            </div>
          )}

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
                  {ORDEN_CARRILES.map((k) => {
                    const on = program === k;
                    const l = LANES[k];
                    return (
                      <button key={k} onClick={() => setProgram(k)} type="button"
                        className="py-4 px-3 rounded-2xl text-left active:scale-[0.98]"
                        style={{
                          background: on ? l.soft : C.surface,
                          border: `1.5px solid ${on ? l.accent : C.border}`,
                          boxShadow: on ? `0 8px 20px -12px ${l.glow}` : "none",
                          transition: "transform 0.12s ease",
                        }}>
                        <span className="relative inline-block mb-2">
                          <Cara quien={k} size={56} anillo={on ? l.accent : "transparent"} />
                          {on && (
                            <span className="absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full
                                             flex items-center justify-center"
                                  style={{ background: l.accent, border: `2px solid ${C.surface}` }}>
                              <Check size={11} strokeWidth={4} color="#fff" />
                            </span>
                          )}
                        </span>
                        <span className="block text-base font-bold leading-tight"
                              style={{ color: on ? l.accent : C.text }}>
                          {l.label}
                        </span>
                        <span className="block text-xs mt-1 leading-tight" style={{ color: C.muted }}>
                          {l.detalle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <Input value={email} onChange={(e) => setEmail(e.target.value.trim())}
                 type="email" placeholder="Correo" autoComplete="email" inputMode="email"
                 onKeyDown={(e) => e.key === "Enter" && isOlvide && submit()}
                 className="w-full" />

          {!isOlvide && (
            <InputClave value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        autoComplete={isUp ? "new-password" : "current-password"}
                        onKeyDown={(e) => e.key === "Enter" && submit()}
                        className="w-full" />
          )}

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
          <div className="mt-3 px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
               style={{ background: "rgba(91,217,138,0.12)", color: C.done,
                        border: "1px solid rgba(91,217,138,0.25)" }}>
            {ok}
          </div>
        )}

        <div className="mt-5">
          <Boton onClick={submit} disabled={busy} lane={lane}>
            {isOlvide ? <Mail size={18} strokeWidth={2.5} />
              : isUp ? <UserPlus size={18} strokeWidth={2.5} />
                : <LogIn size={18} strokeWidth={2.5} />}
            {busy ? "Un momento…"
              : isOlvide ? "Enviarme el link"
                : isUp ? "Crear cuenta" : "Entrar"}
          </Boton>
        </div>

        {/* Solo al entrar: quien está creando su cuenta todavía no tiene
            contraseña que olvidar. */}
        {mode === "in" && (
          <button onClick={() => ir("olvide")}
            className="w-full mt-3 py-2 rounded-2xl text-sm font-medium"
            style={{ color: lane.accent }}>
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <button onClick={() => ir(isUp || isOlvide ? "in" : "up")}
          className="w-full mt-1 py-3 rounded-2xl text-sm font-medium
                     flex items-center justify-center gap-1.5"
          style={{ color: C.muted }}>
          {isOlvide && <ArrowLeft size={15} />}
          {isUp || isOlvide ? "Volver a entrar" : "Crear una cuenta nueva"}
        </button>

        <p className="text-xs mt-7 text-center leading-relaxed" style={{ color: C.faint }}>
          Cada cuenta ve solo sus propios datos. Tu entrenamiento, tu peso y tus comidas
          no son visibles para la otra persona.
        </p>
      </div>
    </div>
  );
}
