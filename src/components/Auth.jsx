import React, { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { C, LANES } from "../data/theme";
import { signIn, signUp, authError } from "../lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

    setBusy(true);
    try {
      if (isUp) {
        await signUp({ email, password, name: name.trim(), program });
        setOk("Cuenta creada. Revisa tu correo para confirmarla y luego entra.");
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

  const field = {
    background: C.surface2,
    color: C.text,
    border: `1px solid ${C.border}`,
  };

  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-sm px-5 py-10">
        <h1 className="text-4xl font-bold leading-none text-center"
            style={{ fontFamily: "Barlow Condensed" }}>
          ENTRENAMOS
        </h1>
        <p className="text-sm text-center mt-2 mb-8" style={{ color: C.muted }}>
          {isUp ? "Crea tu cuenta para empezar" : "Entra con tu cuenta"}
        </p>

        <div className="space-y-3">
          {isUp && (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre" autoComplete="name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={field} />

              <div>
                <div className="text-xs uppercase tracking-widest mb-2"
                     style={{ color: C.faint, fontFamily: "Barlow Condensed", letterSpacing: "0.18em" }}>
                  Tu plan
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["ignacio", "linda"].map((k) => {
                    const on = program === k;
                    return (
                      <button key={k} onClick={() => setProgram(k)} type="button"
                        className="py-3 rounded-xl text-sm font-semibold"
                        style={{
                          background: on ? LANES[k].soft : C.surface,
                          color: on ? LANES[k].accent : C.faint,
                          boxShadow: on ? `inset 0 0 0 1px ${LANES[k].accent}` : `inset 0 0 0 1px ${C.border}`,
                        }}>
                        {k === "ignacio" ? "Speediance · 4 días" : "Plan entrenadora · 5 días"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <input value={email} onChange={(e) => setEmail(e.target.value.trim())}
            type="email" placeholder="Correo" autoComplete="email" inputMode="email"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={field} />

          <input value={password} onChange={(e) => setPassword(e.target.value)}
            type="password" placeholder="Contraseña"
            autoComplete={isUp ? "new-password" : "current-password"}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={field} />
        </div>

        {msg && (
          <div className="mt-3 px-3 py-2 rounded-xl text-xs"
               style={{ background: "rgba(255,90,90,0.12)", color: "#FF8A8A" }}>
            {msg}
          </div>
        )}
        {ok && (
          <div className="mt-3 px-3 py-2 rounded-xl text-xs"
               style={{ background: "rgba(91,217,138,0.12)", color: C.done }}>
            {ok}
          </div>
        )}

        <button onClick={submit} disabled={busy}
          className="w-full mt-5 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: lane.accent, color: "#0E1319" }}>
          {isUp ? <UserPlus size={18} strokeWidth={2.5} /> : <LogIn size={18} strokeWidth={2.5} />}
          {busy ? "Un momento…" : isUp ? "Crear cuenta" : "Entrar"}
        </button>

        <button onClick={() => { setMode(isUp ? "in" : "up"); setMsg(null); setOk(null); }}
          className="w-full mt-3 py-3 rounded-xl text-sm font-medium"
          style={{ color: C.muted }}>
          {isUp ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
        </button>

        <p className="text-xs mt-8 text-center leading-relaxed" style={{ color: C.faint }}>
          Cada cuenta ve solo sus propios datos. Tu entrenamiento, tu peso y tus comidas
          no son visibles para la otra persona.
        </p>
      </div>
    </div>
  );
}
