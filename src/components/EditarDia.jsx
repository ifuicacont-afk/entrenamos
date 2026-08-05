import React, { useState } from "react";
import { X, Check, Dumbbell, Trash2, Scale } from "lucide-react";
import { C } from "../data/theme";
import { PROGRAMS, ORDER } from "../data/programs";
import { MEALS, SUPPS } from "../data/meals";
import { fechaLarga } from "../lib/stats";
import { Boton, Input, Section, labelStyle } from "./ui";

/* ============================================================
   Completar un día que ya pasó.

   Entrenaste el lunes pero no lo anotaste, o marcaste las comidas a
   medias. Acá se puede dejar el registro al día sin inventar nada:
   se guarda con la fecha real, no con la de hoy.

   Las series se rellenan con el objetivo del programa y los pesos
   que la persona viene usando. Es una estimación honesta de lo que
   hizo, no un dato inventado desde cero, y se avisa en pantalla.
   ============================================================ */

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function EditarDia({
  fecha, program, data, lane, onCerrar,
  onRegistrarSesion, onBorrarSesion, onToggleComida, onToggleSupp, onPeso,
}) {
  const prog = PROGRAMS[program];
  const sesiones = data.sessions.filter((s) => s.date === fecha);
  const comidas = data.meals[fecha] || {};
  const supps = data.supps[fecha] || {};
  const pesoDelDia = data.weightLog.find((w) => w.date === fecha);

  const [rutina, setRutina] = useState(null);
  const [minutos, setMinutos] = useState("");
  const [kg, setKg] = useState("");

  const guardarSesion = () => {
    if (!rutina) return;
    const dia = prog[rutina];
    onRegistrarSesion({
      fecha,
      dayId: rutina,
      mins: Math.max(1, parseInt(minutos, 10) || dia.mins),
      /* Se usan los pesos que viene ocupando: es lo más cercano a la
         verdad sin pedirle que recuerde serie por serie. */
      ex: dia.ex.map((e) => ({
        id: e.id,
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({
          kg: data.weights[e.id] ?? e.kg ?? 0,
          reps: e.reps,
        })),
      })),
    });
    setRutina(null);
    setMinutos("");
  };

  const guardarPeso = () => {
    const v = parseFloat(kg.replace(",", "."));
    if (!v || v < 30 || v > 250) return;
    onPeso(fecha, v);
    setKg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
         style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)" }}
         onClick={onCerrar}>
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-y-auto"
           style={{ background: C.bg, maxHeight: "92vh", border: `1px solid ${C.border}` }}
           onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5"
             style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          <div className="min-w-0">
            <div className="text-xs" style={labelStyle}>Completar día</div>
            <div className="text-base font-semibold truncate">{capitalizar(fechaLarga(fecha))}</div>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar"
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.surface2, color: C.muted }}>
            <X size={17} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* ---- entrenamiento ---- */}
          <Section>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={15} style={{ color: lane.accent }} />
              <span className="text-xs" style={labelStyle}>Entrenamiento</span>
            </div>

            {sesiones.length > 0 && (
              <div className="space-y-2 mb-3">
                {sesiones.map((s, i) => (
                  <div key={s.id || i} className="flex items-center justify-between rounded-2xl px-3.5 py-2.5"
                       style={{ background: lane.soft, border: `1px solid ${lane.accent}` }}>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{s.name}</div>
                      <div className="text-xs" style={{ color: C.muted }}>{s.mins} min</div>
                    </div>
                    <button onClick={() => onBorrarSesion(s)} aria-label={`Borrar ${s.name}`}
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: C.surface, color: C.danger }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs mb-2" style={{ color: C.muted }}>
              {sesiones.length ? "Agregar otra rutina" : "¿Qué entrenaste ese día?"}
            </div>
            <div className="space-y-1.5">
              {ORDER[program].map((k) => {
                const on = rutina === k;
                return (
                  <button key={k} onClick={() => setRutina(on ? null : k)}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between"
                          style={{
                            background: on ? lane.soft : C.surface2,
                            border: `1px solid ${on ? lane.accent : C.border}`,
                          }}>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate"
                           style={{ color: on ? lane.accent : C.text }}>
                        {prog[k].name}
                      </div>
                      <div className="text-xs" style={{ color: C.faint }}>{prog[k].day}</div>
                    </div>
                    {on && <Check size={16} strokeWidth={3} style={{ color: lane.accent }} />}
                  </button>
                );
              })}
            </div>

            {rutina && (
              <div className="mt-3">
                <div className="flex gap-2 items-center">
                  <Input value={minutos} onChange={(e) => setMinutos(e.target.value)}
                         inputMode="numeric" className="flex-1"
                         placeholder={`Minutos (por defecto ${prog[rutina].mins})`} />
                </div>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: C.faint }}>
                  Se guardará con las series del programa y los pesos que vienes usando.
                  Si quieres el detalle exacto, hazlo desde la sesión en vivo.
                </p>
                <div className="mt-3">
                  <Boton onClick={guardarSesion} lane={lane} className="!py-3 !text-sm">
                    Guardar entrenamiento
                  </Boton>
                </div>
              </div>
            )}
          </Section>

          {/* ---- comidas ---- */}
          <Section>
            <div className="text-xs mb-3" style={labelStyle}>Comidas de ese día</div>
            <div className="space-y-1.5">
              {MEALS[program].map((m) => {
                const on = !!comidas[m.id];
                return (
                  <button key={m.id} onClick={() => onToggleComida(m.id, fecha)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl"
                          style={{
                            background: on ? lane.soft : C.surface2,
                            border: `1px solid ${on ? lane.accent : C.border}`,
                          }}>
                    <span className="text-sm" style={{ color: on ? lane.accent : C.muted }}>{m.name}</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: on ? lane.accent : "transparent",
                                   border: `1.5px solid ${on ? lane.accent : C.border}` }}>
                      {on && <Check size={13} strokeWidth={3} color="#fff" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ---- suplementos ---- */}
          <Section>
            <div className="text-xs mb-3" style={labelStyle}>Suplementos</div>
            <div className="space-y-1.5">
              {SUPPS[program].map((s) => {
                const on = !!supps[s.id];
                return (
                  <button key={s.id} onClick={() => onToggleSupp(s.id, fecha)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl"
                          style={{
                            background: on ? lane.soft : C.surface2,
                            border: `1px solid ${on ? lane.accent : C.border}`,
                          }}>
                    <span className="text-sm" style={{ color: on ? lane.accent : C.muted }}>{s.name}</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: on ? lane.accent : "transparent",
                                   border: `1.5px solid ${on ? lane.accent : C.border}` }}>
                      {on && <Check size={13} strokeWidth={3} color="#fff" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ---- peso ---- */}
          <Section>
            <div className="flex items-center gap-2 mb-3">
              <Scale size={15} style={{ color: lane.accent }} />
              <span className="text-xs" style={labelStyle}>Peso corporal</span>
            </div>
            {pesoDelDia && (
              <div className="display text-3xl leading-none mb-2" style={{ color: lane.accent }}>
                {pesoDelDia.kg}<span className="text-base ml-1" style={{ color: C.faint }}>kg</span>
              </div>
            )}
            <div className="flex gap-2">
              <Input value={kg} onChange={(e) => setKg(e.target.value)} inputMode="decimal"
                     placeholder={pesoDelDia ? "Corregir el peso" : "Peso de ese día"}
                     className="flex-1"
                     onKeyDown={(e) => e.key === "Enter" && guardarPeso()} />
              <button onClick={guardarPeso} className="px-5 rounded-2xl text-sm font-bold"
                      style={{ background: lane.accent, color: "#fff" }}>
                Guardar
              </button>
            </div>
          </Section>

          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
