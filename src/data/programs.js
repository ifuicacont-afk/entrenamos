/* Programas de entrenamiento.
   El de Linda viene de su entrenadora externa: no modificar sin confirmarlo con ella. */

export const PROG_IGNACIO = {
  A: {
    id: "A", weekday: 2, day: "Martes", name: "Tren Superior A",
    focus: "Pecho · Espalda · Brazos", mins: 32,
    ex: [
      { id: "banca", name: "Press de Banca", setup: "Barra + banco plano · ganchos en posición media", sets: 4, reps: 10, rest: 90, kg: 20 },
      { id: "remo", name: "Remo de Pie", setup: "Mangos · cables BAJOS · inclinado 45°", sets: 4, reps: 10, rest: 90, kg: 15 },
      { id: "hombro", name: "Press de Hombro", setup: "Mangos · cables BAJOS · de pie", sets: 3, reps: 12, rest: 75, kg: 8 },
      { id: "jalon", name: "Jalón al Pecho", setup: "Barra · cable ALTO · sentado", sets: 3, reps: 12, rest: 75, kg: 25 },
      { id: "curl", name: "Curl de Bíceps", setup: "Mangos · cables BAJOS · de pie", sets: 3, reps: 12, rest: 60, kg: 8 },
    ],
  },
  B: {
    id: "B", weekday: 3, day: "Miércoles", name: "Tren Inferior A",
    focus: "Cuádriceps · Glúteos · Core", mins: 30,
    ex: [
      { id: "sentadilla", name: "Sentadilla", setup: "Barra + ganchos en posición ALTA · banco detrás como tope", sets: 4, reps: 10, rest: 120, kg: 22 },
      { id: "rumano", name: "Peso Muerto Rumano", setup: "Barra · cables BAJOS · piernas semi extendidas", sets: 3, reps: 10, rest: 90, kg: 20 },
      { id: "hip", name: "Hip Thrust", setup: "Cinturón · cable BAJO · espalda apoyada en banco", sets: 3, reps: 12, rest: 75, kg: 20 },
      { id: "curlpierna", name: "Curl de Pierna", setup: "Correas en tobillos · cable BAJO · boca abajo", sets: 3, reps: 12, rest: 60, kg: 12 },
      { id: "plancha", name: "Plancha con Cable", setup: "Mango · cable MEDIO · sostener tensión", sets: 3, reps: 30, unit: "seg", rest: 45, kg: 5 },
    ],
  },
  C: {
    id: "C", weekday: 5, day: "Viernes", name: "Tren Superior B",
    focus: "Espalda · Hombros · Brazos", mins: 32,
    ex: [
      { id: "inclinado", name: "Press Inclinado", setup: "Barra + banco a 30-45° · ganchos en posición media", sets: 4, reps: 10, rest: 90, kg: 18 },
      { id: "remo", name: "Remo de Pie", setup: "Mangos · cables BAJOS · inclinado 45°", sets: 4, reps: 10, rest: 90, kg: 15 },
      { id: "laterales", name: "Elevaciones Laterales", setup: "Mangos · cables BAJOS · brazos al costado", sets: 3, reps: 12, rest: 60, kg: 5 },
      { id: "facepull", name: "Face Pull", setup: "Cuerda · cable ALTO · tirar hacia la cara, codos arriba", sets: 3, reps: 15, rest: 60, kg: 8 },
      { id: "triceps", name: "Extensión de Tríceps", setup: "Cuerda · cable ALTO · codos fijos al cuerpo", sets: 3, reps: 12, rest: 60, kg: 12 },
    ],
  },
  D: {
    id: "D", weekday: 6, day: "Sábado", name: "Tren Inferior B",
    focus: "Glúteos · Isquios · Cardio", mins: 35,
    ex: [
      { id: "sumo", name: "Peso Muerto Sumo", setup: "Barra · cables BAJOS · piernas abiertas, puntas hacia afuera", sets: 4, reps: 10, rest: 120, kg: 22 },
      { id: "goblet", name: "Sentadilla Goblet", setup: "Mango · cable BAJO · sostener frente al pecho", sets: 3, reps: 12, rest: 90, kg: 18 },
      { id: "extpierna", name: "Extensión de Pierna", setup: "Correas en tobillos · cable BAJO · sentado", sets: 3, reps: 12, rest: 60, kg: 12 },
      { id: "crunch", name: "Crunch con Cable", setup: "Cuerda · cable ALTO · arrodillado mirando la máquina", sets: 3, reps: 15, rest: 45, kg: 10 },
      { id: "cardio", name: "Cardio", setup: "Remo en la Speediance o salida en bici · ritmo cómodo", sets: 1, reps: 15, unit: "min", rest: 0, kg: 0, cardio: true },
    ],
  },
};

/* ============================================================
   PROGRAMA DE LINDA — plan de su entrenadora
   Descanso 40 seg · 25 min de cardio al terminar
   ============================================================ */
export const PROG_LINDA = {
  LUN: {
    id: "LUN", weekday: 1, day: "Lunes", name: "Pierna",
    focus: "Cuádriceps · Glúteo", mins: 45, cardio: 25,
    ex: [
      { id: "sentcomb", name: "Sentadilla combinada", setup: "Barra o mango + cable BAJO · sostener al pecho", sets: 4, reps: 20, kg: 10 },
      { id: "estocadas", name: "Estocadas", setup: "Mangos + cables BAJOS · zancada alternada", sets: 4, reps: 20, kg: 6 },
      { id: "saltos", name: "Saltos", setup: "Sin peso · salto desde media sentadilla", sets: 4, reps: 20, kg: 0 },
      { id: "sentiso", name: "Sentadilla isométrica", setup: "Sin peso · espalda apoyada en la pared", sets: 4, reps: 30, unit: "seg", kg: 0 },
      { id: "flexcuad", name: "Flexión de cuádriceps", setup: "Banda en tobillos o correas + cable BAJO", sets: 4, reps: 25, kg: 4 },
      { id: "pantorrillas", name: "Pantorrillas", setup: "De pie · mango + cable BAJO o peso corporal", sets: 4, reps: 30, kg: 8 },
    ],
  },
  MAR: {
    id: "MAR", weekday: 2, day: "Martes", name: "Espalda y Tríceps",
    focus: "Dorsal · Deltoides posterior · Tríceps", mins: 40, cardio: 25,
    ex: [
      { id: "remoalt", name: "Remo alternado", setup: "Mango individual + cable BAJO · inclinada, un brazo", sets: 4, reps: 20, kg: 8 },
      { id: "vueloposte", name: "Vuelo posterior", setup: "Mangos + cables BAJOS cruzados · tronco inclinado", sets: 4, reps: 20, kg: 4 },
      { id: "tricepsmanc", name: "Tríceps sobre la cabeza", setup: "Cuerda + cable BAJO · extender sobre la cabeza", sets: 4, reps: 20, kg: 6 },
      { id: "exttriceps", name: "Extensión de tríceps", setup: "Cuerda + cable ALTO · codos fijos al cuerpo", sets: 4, reps: 20, kg: 6 },
      { id: "patadatri", name: "Patada de tríceps", setup: "Mango + cable BAJO · tronco inclinado", sets: 4, reps: 20, kg: 4 },
    ],
  },
  MIE: {
    id: "MIE", weekday: 3, day: "Miércoles", name: "Glúteo e Isquios",
    focus: "Glúteo · Femoral · Abductores", mins: 50, cardio: 25,
    ex: [
      { id: "pesomuerto", name: "Peso muerto", setup: "Barra + cables BAJOS · espalda recta", sets: 4, reps: 20, kg: 12 },
      { id: "bulgaras", name: "Búlgaras", setup: "Mango + cable BAJO · pie trasero apoyado en el banco", sets: 4, reps: 20, kg: 6 },
      { id: "patadaglut", name: "Patada de glúteo", setup: "Correa de tobillo + cable BAJO · patada hacia atrás", sets: 4, reps: 20, kg: 5 },
      { id: "patadalat", name: "Patada de glúteo lateral", setup: "Correa de tobillo + cable BAJO · apertura lateral", sets: 4, reps: 20, kg: 5 },
      { id: "hipthrust", name: "Hip thrust", setup: "Cinturón + cable BAJO · espalda apoyada en el banco", sets: 4, reps: 20, kg: 15 },
      { id: "camillafem", name: "Camilla femoral", setup: "Correas de tobillo + cable BAJO · boca abajo en el banco", sets: 4, reps: 20, kg: 7 },
      { id: "abductor", name: "Abductor", setup: "Correa de tobillo + cable MEDIO · apertura de pie", sets: 4, reps: 20, kg: 5 },
    ],
  },
  JUE: {
    id: "JUE", weekday: 4, day: "Jueves", name: "Hombro, Pecho y Bíceps",
    focus: "Deltoides · Pectoral · Bíceps", mins: 50, cardio: 25,
    ex: [
      { id: "elevfrontal", name: "Elevación frontal", setup: "Mangos + cables BAJOS · alternando brazos", sets: 4, reps: 20, kg: 3 },
      { id: "vueloslat", name: "Vuelos laterales", setup: "Mangos + cables BAJOS · subir hasta el hombro", sets: 4, reps: 20, kg: 3 },
      { id: "pressmil", name: "Press militar", setup: "Mangos + cables BAJOS · de pie, empujar arriba", sets: 4, reps: 20, kg: 5 },
      { id: "remomenton", name: "Remo al mentón", setup: "Barra o mangos + cables BAJOS · codos altos", sets: 4, reps: 20, kg: 6 },
      { id: "pullover", name: "Pullover", setup: "Cuerda o mango + cable ALTO · acostada en el banco", sets: 4, reps: 20, kg: 6 },
      { id: "presspecho", name: "Press de pecho", setup: "Mangos + banco plano · empujar hacia arriba", sets: 4, reps: 20, kg: 8 },
      { id: "curliso", name: "Curl bíceps isométrico", setup: "Mangos + cables BAJOS · sostener arriba entre reps", sets: 4, reps: 20, kg: 4 },
    ],
  },
  VIE: {
    id: "VIE", weekday: 5, day: "Viernes", name: "Glúteo e Isquios",
    focus: "Glúteo · Femoral · Suelo y banda", mins: 45, cardio: 25,
    ex: [
      { id: "elevunapierna", name: "Elevación a una pierna", setup: "Puente de glúteo unilateral · peso sobre la cadera", sets: 4, reps: 20, kg: 5 },
      { id: "elevacion", name: "Elevación", setup: "Puente de glúteo con las dos piernas · peso en la cadera", sets: 4, reps: 20, kg: 8 },
      { id: "abductores", name: "Abductores", setup: "Puente con banda sobre las rodillas · abrir y cerrar", sets: 4, reps: 20, kg: 0 },
      { id: "curlfem", name: "Curl de femoral", setup: "Boca abajo · correas de tobillo + cable BAJO", sets: 4, reps: 20, kg: 6 },
      { id: "patada", name: "Patada", setup: "En cuadrupedia · banda o correa de tobillo + cable BAJO", sets: 4, reps: 20, kg: 4 },
      { id: "pesomuerto", name: "Peso muerto", setup: "Barra + cables BAJOS · espalda recta", sets: 4, reps: 20, kg: 12 },
      { id: "flexfem", name: "Flexión de femoral", setup: "De pie · banda o correa de tobillo + cable BAJO", sets: 4, reps: 20, kg: 4 },
    ],
  },
  ABD: {
    id: "ABD", weekday: 6, day: "Sábado", name: "Complementario Abdominal",
    focus: "Core · Martes, Jueves y Sábado", mins: 12,
    ex: [
      { id: "crunchnuca", name: "Crunch con manos en la nuca", setup: "En el suelo · rodillas flectadas · subir sin tirar del cuello", sets: 4, reps: 40, unit: "seg", kg: 0 },
      { id: "tijeras", name: "Tijeras sentada", setup: "Sentada, apoyada atrás · elevar piernas alternando", sets: 4, reps: 40, unit: "seg", kg: 0 },
      { id: "elevpiernas", name: "Elevación de piernas en V", setup: "Sentada, apoyada atrás · subir las dos piernas juntas", sets: 4, reps: 40, unit: "seg", kg: 0 },
      { id: "crunch", name: "Crunch clásico", setup: "En el suelo · subir el tronco de forma controlada", sets: 4, reps: 40, unit: "seg", kg: 0 },
    ],
  },
};

export const PROGRAMS = { ignacio: PROG_IGNACIO, linda: PROG_LINDA };
export const ORDER = { ignacio: ["A", "B", "C", "D"], linda: ["LUN", "MAR", "MIE", "JUE", "VIE", "ABD"] };
export const WEEK_GOAL = { ignacio: 4, linda: 3 };
export const FIXED_REST = { ignacio: null, linda: 40 };

/* Días en que Linda suma el circuito de abdomen */
export const ABS_DAYS = [2, 4, 6];
