import { supabase, isConfigured } from "./supabase";
import { PROGRAMS } from "../data/programs";

/* ============================================================
   Capa de datos.

   Tres reglas para que nunca se pierda nada:

   1. Todo se escribe primero en el dispositivo (localStorage).
      La app responde al instante y funciona sin señal.
   2. Lo que no se pudo mandar a Supabase queda en una "bandeja de
      salida" y se reintenta la próxima vez que abras la app.
   3. Al iniciar, lo del servidor y lo del dispositivo se MEZCLAN.
      Nunca se reemplaza uno por el otro, así que ningún registro
      hecho sin señal se borra.

   Cada sesión y cada cardio llevan un id propio, así reintentar
   nunca duplica un registro que sí había llegado.
   ============================================================ */

const KEY = (uid) => `entrenamos:${uid || "local"}`;
const OUTBOX = (uid) => `entrenamos:pendientes:${uid || "local"}`;

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const nuevoId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function startWeights(program) {
  const out = {};
  Object.values(PROGRAMS[program]).forEach((d) =>
    d.ex.forEach((e) => { out[e.id] = e.kg; })
  );
  return out;
}

export const emptyData = (program) => ({
  weights: startWeights(program),
  sessions: [],
  weightLog: [],
  rides: [],
  meals: {},
  supps: {},
  active: null,
});

/* ---------- local ---------- */

export function readLocal(uid, program) {
  try {
    const raw = localStorage.getItem(KEY(uid));
    return raw ? { ...emptyData(program), ...JSON.parse(raw) } : emptyData(program);
  } catch {
    return emptyData(program);
  }
}

export function writeLocal(uid, data) {
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(data));
  } catch {
    /* Cuota llena o modo privado: la app sigue funcionando en memoria. */
  }
}

/* ---------- bandeja de salida ---------- */

function leerPendientes(uid) {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX(uid)) || "[]");
  } catch {
    return [];
  }
}

function guardarPendientes(uid, items) {
  try {
    /* Se recortan los más viejos antes que crecer sin límite. */
    localStorage.setItem(OUTBOX(uid), JSON.stringify(items.slice(-300)));
  } catch {
    /* Sin espacio: el dato igual está en el estado local. */
  }
}

function encolar(uid, tipo, args) {
  guardarPendientes(uid, [...leerPendientes(uid), { tipo, args }]);
}

/* Se llama al abrir la app: reintenta todo lo que quedó sin mandar. */
export async function flushPendientes(uid) {
  if (!isConfigured || !uid) return 0;
  const cola = leerPendientes(uid);
  if (!cola.length) return 0;

  const quedan = [];
  for (const item of cola) {
    try {
      await ENVIOS[item.tipo]?.(uid, ...item.args);
    } catch {
      quedan.push(item);
    }
  }
  guardarPendientes(uid, quedan);
  return cola.length - quedan.length;
}

/* ---------- remoto ---------- */

export async function pullRemote(uid, program) {
  if (!isConfigured || !uid) return null;

  const [sessions, weights, body, cardio, checks] = await Promise.all([
    supabase.from("sessions").select("*").order("date", { ascending: false }).limit(500),
    supabase.from("exercise_weights").select("exercise_id, kg"),
    supabase.from("body_weight").select("date, kg").order("date", { ascending: false }),
    supabase.from("cardio").select("client_id, date, mins").order("date", { ascending: false }).limit(300),
    supabase.from("daily_checks").select("date, meals, supps"),
  ]);

  const data = emptyData(program);

  if (sessions.data) {
    data.sessions = sessions.data.map((s) => ({
      id: s.client_id, date: s.date, dayId: s.day_id,
      name: s.name, mins: s.mins, ex: s.exercises,
    }));
  }
  if (weights.data) {
    weights.data.forEach((w) => { data.weights[w.exercise_id] = Number(w.kg); });
  }
  if (body.data) {
    data.weightLog = body.data.map((b) => ({ date: b.date, kg: Number(b.kg) }));
  }
  if (cardio.data) {
    data.rides = cardio.data.map((c) => ({ id: c.client_id, date: c.date, mins: c.mins }));
  }
  if (checks.data) {
    checks.data.forEach((c) => {
      data.meals[c.date] = c.meals || {};
      data.supps[c.date] = c.supps || {};
    });
  }
  return data;
}

/* Une servidor y dispositivo sin perder nada de ninguno de los dos. */
export function mergeData(local, remote) {
  if (!remote) return local;
  if (!local) return remote;

  const unir = (a, b, clave) => {
    const m = new Map();
    [...a, ...b].forEach((x) => { const k = clave(x); if (!m.has(k)) m.set(k, x); });
    return [...m.values()];
  };

  /* Las sesiones y el cardio se identifican por su id propio. */
  const sessions = unir(remote.sessions, local.sessions,
    (s) => s.id || `${s.date}|${s.dayId}|${s.mins}`)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const rides = unir(remote.rides, local.rides,
    (r) => r.id || `${r.date}|${r.mins}`)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const weightLog = unir(remote.weightLog, local.weightLog, (w) => w.date)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  /* En las marcas del día gana lo del dispositivo: si tocaste algo sin
     señal, la bandeja de salida lo va a subir igual. */
  const porFecha = (r, l) => {
    const out = { ...r };
    Object.keys(l).forEach((f) => { out[f] = { ...(r[f] || {}), ...l[f] }; });
    return out;
  };

  return {
    ...local,
    /* Acá manda el servidor: en un dispositivo nuevo lo local son
       solo los pesos por defecto del programa. */
    weights: { ...local.weights, ...remote.weights },
    sessions,
    rides,
    weightLog,
    meals: porFecha(remote.meals, local.meals),
    supps: porFecha(remote.supps, local.supps),
    active: local.active ?? null,
  };
}

/* Cada escritura manda solo lo que cambió, no el estado entero.
   Si falla, queda en la bandeja de salida y se reintenta. */

async function envioSession(uid, session) {
  const { error } = await supabase.from("sessions").upsert({
    user_id: uid,
    client_id: session.id,
    date: session.date,
    day_id: session.dayId,
    name: session.name,
    mins: session.mins,
    exercises: session.ex,
  }, { onConflict: "user_id,client_id" });
  if (error) throw error;
}

async function envioWeight(uid, exerciseId, kg) {
  const { error } = await supabase.from("exercise_weights")
    .upsert({ user_id: uid, exercise_id: exerciseId, kg, updated_at: new Date().toISOString() },
            { onConflict: "user_id,exercise_id" });
  if (error) throw error;
}

async function envioBodyWeight(uid, date, kg) {
  const { error } = await supabase.from("body_weight")
    .upsert({ user_id: uid, date, kg }, { onConflict: "user_id,date" });
  if (error) throw error;
}

async function envioCardio(uid, ride) {
  const { error } = await supabase.from("cardio")
    .upsert({ user_id: uid, client_id: ride.id, date: ride.date, mins: ride.mins },
            { onConflict: "user_id,client_id" });
  if (error) throw error;
}

async function envioChecks(uid, date, meals, supps) {
  const { error } = await supabase.from("daily_checks")
    .upsert({ user_id: uid, date, meals, supps }, { onConflict: "user_id,date" });
  if (error) throw error;
}

const ENVIOS = {
  session: envioSession,
  weight: envioWeight,
  bodyWeight: envioBodyWeight,
  cardio: envioCardio,
  checks: envioChecks,
};

/* Envoltura común: intenta mandar y, si no puede, lo deja pendiente. */
function mandar(tipo) {
  return async (uid, ...args) => {
    if (!isConfigured || !uid) return;
    try {
      await ENVIOS[tipo](uid, ...args);
    } catch {
      encolar(uid, tipo, args);
    }
  };
}

export const pushSession = mandar("session");
export const pushWeight = mandar("weight");
export const pushBodyWeight = mandar("bodyWeight");
export const pushCardio = mandar("cardio");
export const pushChecks = mandar("checks");

/* ---------- utilidades ---------- */

export function startOfWeek(d) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
}
