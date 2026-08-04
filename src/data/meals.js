/* Alimentación. El plan de Linda es el que le entregó su entrenadora. */

export const TARGETS = {
  ignacio: { kcal: 2100, p: 155 },
  linda: { kcal: 1490, p: 148 },
};

export const MEALS = {
  ignacio: [
    { id: "des", name: "Desayuno", kcal: 520, p: 40, opts: [
      "3 huevos revueltos + 60g avena con leche + 1 plátano",
      "Licuado: 1 scoop whey + 60g avena + 1 plátano + 200ml leche",
      "200g yogur griego + 50g granola + 1 manzana",
    ]},
    { id: "alm", name: "Almuerzo", kcal: 620, p: 50, opts: [
      "200g pollo + 80g arroz + ensalada + 1 cda aceite de oliva",
      "180g carne molida + 70g pasta + salsa de tomate + verduras",
      "180g pescado + 200g papa + ensalada + 1 cda aceite",
    ]},
    { id: "snk", name: "Post-entreno", kcal: 350, p: 32, opts: [
      "1 scoop whey + 5g creatina + 1 plátano",
      "2 huevos duros + 2 tostadas integrales + palta",
      "1 lata de atún + 4 galletas de arroz + 1/4 palta",
    ]},
    { id: "cen", name: "Cena", kcal: 500, p: 35, opts: [
      "2 latas de atún + palta + tomate + 2 tostadas",
      "150g pollo + verduras salteadas + 50g arroz",
      "Omelette de 3 huevos con queso + ensalada + 1 tostada",
    ]},
  ],
  linda: [
    { id: "des", name: "Desayuno", kcal: 180, p: 16, opts: [
      "4 claras de huevo + 10 almendras",
      "Omelette + 10 almendras",
      "4 claras de huevo + 1 tostada de pan",
      "3 panquecas de avena",
      "Arepa 40g + 4 claras de huevo",
    ]},
    { id: "sn1", name: "Snack de media mañana", kcal: 270, p: 13, opts: [
      "1 manzana verde",
      "Yogurt con 10 almendras",
      "80g de piña",
    ]},
    { id: "alm", name: "Almuerzo", kcal: 350, p: 42, opts: [
      "180g pollo + 100g tomate + 100g pepino",
      "180g reineta + 80g puré de papa",
      "180g salmón + 1/3 papa + pepino, tomate y lechuga",
      "180g pollo + 100g tomate + 100g pepino",
      "180g reineta + 80g puré de papa",
    ]},
    { id: "sn2", name: "Snack de tarde", kcal: 270, p: 13, opts: [
      "1 manzana verde",
      "Yogurt con 10 almendras",
      "80g de piña",
    ]},
    { id: "cen", name: "Cena", kcal: 300, p: 40, opts: [
      "180g pollo + 50g lechuga + 100g pepino",
      "150g pollo + 100g tomate + 100g pepino",
      "5 claras de huevo + 1 tostada de arroz",
      "180g pollo + 50g lechuga + 100g pepino",
    ]},
    { id: "prot", name: "Proteína", kcal: 120, p: 24, opts: [
      "1 scoop de proteína",
    ]},
  ],
};

export const SUPPS = {
  ignacio: [
    { id: "greens", name: "Daily Greens", when: "Mañana, con agua" },
    { id: "colageno", name: "Colágeno", when: "Mañana, con agua o café" },
    { id: "boost", name: "Boost Hidratación", when: "Durante el entrenamiento" },
    { id: "whey", name: "Whey Protein", when: "Post-entreno, 1 scoop" },
    { id: "crea", name: "Creatina 5g", when: "Con el shake · todos los días" },
    { id: "mag", name: "Magnesio", when: "30 min antes de dormir" },
  ],
  linda: [
    { id: "whey", name: "Proteína", when: "1 scoop al día · según su plan" },
    { id: "agua", name: "Agua", when: "2 a 2.5 litros repartidos en el día" },
    { id: "mag", name: "Magnesio (opcional)", when: "30 min antes de dormir" },
  ],
};
