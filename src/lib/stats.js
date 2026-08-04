import { PROGRAMS, ORDER, ABS_DAYS, WEEK_GOAL } from "../data/programs";
import { MEALS, SUPPS } from "../data/meals";

/* ============================================================
   Cálculos de progreso para el calendario.

   Todo se deriva de lo que ya está guardado (sesiones, comidas,
   suplementos, cardio y peso). No hay datos nuevos que guardar.
   ============================================================ */

export const keyOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseKey = (k) => new Date(k + "T12:00");

/* Peso de cada parte del día. Entrenar pesa más, pero comer bien
   sostiene el día aunque toque descansar. */
const W = { entreno: 45, comida: 40, supp: 15 };

/* Las sesiones que el programa pide para ese día de la semana. */
export function plannedFor(program, weekday) {
  const prog = PROGRAMS[program];
  const ids = ORDER[program].filter((k) => prog[k].weekday === weekday);
  if (program === "linda" && ABS_DAYS.includes(weekday) && !ids.includes("ABD")) ids.push("ABD");
  return ids;
}

/* Radiografía de un día: qué tocaba, qué se hizo y cuánto se completó. */
export function dayDetail(program, data, key) {
  const weekday = parseKey(key).getDay();
  const planned = plannedFor(program, weekday);
  const sessions = data.sessions.filter((s) => s.date === key);

  const meals = MEALS[program];
  const supps = SUPPS[program];
  const mc = data.meals[key] || {};
  const sc = data.supps[key] || {};
  const mealsDone = meals.filter((m) => mc[m.id]).length;
  const suppsDone = supps.filter((s) => sc[s.id]).length;

  const rides = data.rides.filter((r) => r.date === key);
  const cardioMins = rides.reduce((a, r) => a + r.mins, 0);
  const weight = data.weightLog.find((w) => w.date === key)?.kg ?? null;

  const volume = sessions.reduce(
    (a, s) => a + s.ex.reduce((x, e) => x + e.sets.reduce((y, z) => y + z.kg * z.reps, 0), 0),
    0
  );
  const mins = sessions.reduce((a, s) => a + s.mins, 0);

  /* El entrenamiento solo entra en la cuenta si tocaba o si se hizo.
     Un día de descanso no se castiga por no entrenar. */
  const parts = [];
  const cuenta = planned.length > 0 || sessions.length > 0;
  if (cuenta) {
    const meta = Math.max(1, planned.length);
    parts.push([W.entreno, Math.min(1, sessions.length / meta)]);
  }
  parts.push([W.comida, meals.length ? mealsDone / meals.length : 0]);
  parts.push([W.supp, supps.length ? suppsDone / supps.length : 0]);

  const peso = parts.reduce((a, [w]) => a + w, 0);
  const pct = Math.round((parts.reduce((a, [w, v]) => a + w * v, 0) / peso) * 100);

  return {
    key,
    pct,
    planned,
    sessions,
    entreno: sessions.length > 0,
    descanso: planned.length === 0,
    meals: { done: mealsDone, total: meals.length },
    supps: { done: suppsDone, total: supps.length },
    cardioMins,
    weight,
    volume,
    mins,
    vacio: sessions.length === 0 && mealsDone === 0 && suppsDone === 0 && !cardioMins && weight == null,
  };
}

/* Lunes primero, como los calendarios de acá. */
export const mondayIndex = (d) => (d.getDay() + 6) % 7;

/* La grilla del mes: incluye los días vacíos del principio para calzar. */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const pad = mondayIndex(first);
  const cells = Array(pad).fill(null);
  for (let d = 1; d <= days; d++) cells.push(keyOf(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/* Resumen del mes. Solo cuenta los días que ya pasaron. */
export function monthStats(program, data, year, month) {
  const hoy = keyOf(new Date());
  const dias = monthGrid(year, month).filter((k) => k && k <= hoy);

  let sesiones = 0, cardio = 0, comidaDone = 0, comidaTot = 0, suma = 0, activos = 0, volumen = 0;
  dias.forEach((k) => {
    const d = dayDetail(program, data, k);
    sesiones += d.sessions.length;
    cardio += d.cardioMins;
    comidaDone += d.meals.done;
    comidaTot += d.meals.total;
    volumen += d.volume;
    suma += d.pct;
    if (!d.vacio) activos++;
  });

  /* La meta del mes sigue la filosofía de la app: la meta semanal,
     no todos los cupos posibles del programa. */
  const meta = Math.round((WEEK_GOAL[program] * dias.length) / 7);

  return {
    dias: dias.length,
    sesiones,
    meta,
    cardio,
    volumen,
    activos,
    comida: comidaTot ? Math.round((comidaDone / comidaTot) * 100) : 0,
    promedio: dias.length ? Math.round(suma / dias.length) : 0,
  };
}

/* Semanas seguidas cumpliendo la meta, mirando hacia atrás desde hoy. */
export function streaks(program, data) {
  const goal = WEEK_GOAL[program];
  const minimo = Math.min(2, goal);

  const lunes = new Date();
  lunes.setDate(lunes.getDate() - mondayIndex(lunes));
  lunes.setHours(0, 0, 0, 0);

  const porSemana = [];
  for (let w = 0; w < 104; w++) {
    const ini = new Date(lunes); ini.setDate(ini.getDate() - 7 * w);
    const fin = new Date(ini); fin.setDate(fin.getDate() + 7);
    porSemana.push(
      data.sessions.filter((s) => {
        const d = parseKey(s.date);
        return d >= ini && d < fin;
      }).length
    );
  }

  let actual = 0;
  for (let i = 0; i < porSemana.length; i++) {
    if (porSemana[i] >= minimo) actual++;
    else if (i > 0) break;
  }

  let mejor = 0, run = 0;
  porSemana.forEach((c) => {
    if (c >= minimo) { run++; mejor = Math.max(mejor, run); }
    else run = 0;
  });

  return { actual, mejor };
}

/* Todo el historial, desde el primer registro. */
export function totales(program, data) {
  const fechas = [
    ...data.sessions.map((s) => s.date),
    ...data.weightLog.map((w) => w.date),
    ...data.rides.map((r) => r.date),
    ...Object.keys(data.meals),
    ...Object.keys(data.supps),
  ].filter(Boolean).sort();

  const volumen = data.sessions.reduce(
    (a, s) => a + s.ex.reduce((x, e) => x + e.sets.reduce((y, z) => y + z.kg * z.reps, 0), 0),
    0
  );

  return {
    desde: fechas[0] || null,
    sesiones: data.sessions.length,
    volumen,
    minutos: data.sessions.reduce((a, s) => a + s.mins, 0),
    cardio: data.rides.reduce((a, r) => a + r.mins, 0),
    dias: new Set(fechas).size,
  };
}

/* 12.400 kg se lee mejor como 12,4 toneladas. */
export function fmtKg(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace(".", ",")} t`;
  return `${Math.round(kg)} kg`;
}

export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function fechaLarga(key) {
  const d = parseKey(key);
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  return `${dias[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
