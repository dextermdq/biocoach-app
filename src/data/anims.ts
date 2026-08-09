/**
 * Figuras de palo animadas.
 *
 * Cada animación son dos poses (a / b) que se interpolan punto a punto en loop
 * de ida y vuelta. Regla dura: un mismo miembro debe tener LA MISMA cantidad de
 * puntos en la pose a y en la b, si no la interpolación no cierra.
 *
 * Sistema de coordenadas: viewBox 0 0 220 150, piso en y=123.
 */

export type Pt = [number, number];

export type Pose = {
  /** Polilíneas: brazos, piernas, torso. */
  limbs: Pt[][];
  /** Centro de la cabeza. */
  head: Pt;
  /** Halo opcional (respiración / kegel): se dibuja detrás de la figura. */
  aura?: { c: Pt; r: number };
};

export type Anim = {
  a: Pose;
  b: Pose;
  /** Duración de media repetición, en ms. */
  dur: number;
  headR: number;
};

const GROUND_Y = 123;
export { GROUND_Y };

// ─── Empujes ────────────────────────────────────────────────────────────────

/** Flexiones: el torso baja y sube, los codos se abren. */
const pushup: Anim = {
  dur: 1150,
  headR: 11,
  a: {
    limbs: [
      [[58, 123], [60, 108], [66, 96]], // mano, codo, hombro
      [[66, 96], [128, 106], [158, 114]], // hombro, cadera, pies
    ],
    head: [51, 93],
  },
  b: {
    limbs: [
      [[58, 123], [75, 113], [66, 104]],
      [[66, 104], [128, 113], [158, 117]],
    ],
    head: [51, 101],
  },
};

/** Press de pecho en el piso: acostado, los brazos empujan hacia arriba. */
const floorPress: Anim = {
  dur: 1250,
  headR: 11,
  a: {
    limbs: [
      [[70, 116], [120, 116]], // hombro, cadera
      [[120, 116], [146, 97], [168, 123]], // cadera, rodilla, pie
      [[72, 116], [75, 94], [79, 71]], // brazo extendido arriba
    ],
    head: [56, 112],
  },
  b: {
    limbs: [
      [[70, 116], [120, 116]],
      [[120, 116], [146, 97], [168, 123]],
      [[72, 116], [58, 101], [86, 97]], // codo abajo, rozando el piso
    ],
    head: [56, 112],
  },
};

/** Flexiones de pica: cadera alta, la cabeza baja entre las manos. */
const pikePushup: Anim = {
  dur: 1250,
  headR: 11,
  a: {
    limbs: [
      [[58, 123], [62, 105], [70, 90]], // mano, codo, hombro
      [[70, 90], [118, 62], [166, 123]], // hombro, cadera alta, pies
    ],
    head: [58, 82],
  },
  b: {
    limbs: [
      [[58, 123], [76, 112], [76, 98]],
      [[76, 98], [118, 66], [166, 123]],
    ],
    head: [62, 106],
  },
};

// ─── Patrón de piernas ──────────────────────────────────────────────────────

/** Sentadilla goblet: cadera y torso bajan, mancuerna al pecho. */
const squat: Anim = {
  dur: 1300,
  headR: 11,
  a: {
    limbs: [
      [[110, 123], [110, 99], [110, 91]], // pie, rodilla, cadera
      [[110, 91], [110, 60]], // cadera, hombro
      [[110, 70], [126, 75]], // pecho, manos
    ],
    head: [110, 49],
  },
  b: {
    limbs: [
      [[110, 123], [125, 103], [103, 109]],
      [[103, 109], [99, 79]],
      [[100, 88], [116, 93]],
    ],
    head: [99, 68],
  },
};

/** Sentadilla búlgara: pie de atrás elevado, la rodilla de adelante baja. */
const bulgarian: Anim = {
  dur: 1350,
  headR: 11,
  a: {
    limbs: [
      [[96, 123], [96, 100], [100, 92]], // pierna de adelante
      [[100, 92], [128, 104], [152, 100]], // cadera, rodilla atrás, pie elevado
      [[100, 92], [100, 62]], // torso
      [[100, 74], [104, 96]], // brazo colgando
    ],
    head: [100, 51],
  },
  b: {
    limbs: [
      [[96, 123], [92, 101], [104, 110]],
      [[104, 110], [130, 118], [152, 100]],
      [[104, 110], [100, 80]],
      [[102, 92], [106, 114]],
    ],
    head: [100, 69],
  },
};

/** Peso muerto rumano: la cadera va atrás y el torso se inclina. */
const hinge: Anim = {
  dur: 1400,
  headR: 11,
  a: {
    limbs: [
      [[110, 123], [110, 99], [110, 91]],
      [[110, 91], [110, 60]],
      [[110, 72], [112, 96]], // manos con mancuernas
    ],
    head: [110, 49],
  },
  b: {
    limbs: [
      [[110, 123], [114, 100], [124, 95]],
      [[124, 95], [88, 79]],
      [[104, 86], [98, 110]],
    ],
    head: [77, 75],
  },
};

/** Puente de glúteos: la cadera sube desde el piso. */
const bridge: Anim = {
  dur: 1300,
  headR: 11,
  a: {
    limbs: [
      [[70, 118], [112, 118]], // hombro, cadera
      [[112, 118], [144, 100], [162, 123]], // cadera, rodilla, pie
      [[80, 118], [98, 121]], // brazo al costado
    ],
    head: [56, 114],
  },
  b: {
    limbs: [
      [[70, 118], [114, 94]],
      [[114, 94], [146, 92], [162, 123]],
      [[80, 118], [98, 121]],
    ],
    head: [56, 114],
  },
};

/** Remo con mancuerna: torso inclinado, el codo tira hacia la cadera. */
const row: Anim = {
  dur: 1250,
  headR: 11,
  a: {
    limbs: [
      [[132, 123], [128, 101], [138, 94]], // pierna
      [[138, 94], [96, 80]], // cadera, hombro
      [[98, 82], [98, 96], [97, 112]], // brazo estirado
    ],
    head: [84, 76],
  },
  b: {
    limbs: [
      [[132, 123], [128, 101], [138, 94]],
      [[138, 94], [96, 80]],
      [[98, 82], [112, 92], [100, 100]], // codo atrás, mancuerna arriba
    ],
    head: [84, 76],
  },
};

// ─── Abdominales ────────────────────────────────────────────────────────────

/** Elevación de piernas: acostado, las piernas suben juntas. */
const legRaise: Anim = {
  dur: 1300,
  headR: 11,
  a: {
    limbs: [
      [[64, 118], [112, 118]],
      [[112, 118], [144, 119], [176, 120]], // piernas abajo
      [[76, 118], [94, 121]],
    ],
    head: [50, 114],
  },
  b: {
    limbs: [
      [[64, 118], [112, 118]],
      [[112, 118], [130, 92], [140, 62]], // piernas arriba
      [[76, 118], [94, 121]],
    ],
    head: [50, 114],
  },
};

/** Escaladores: en plancha, las rodillas alternan al pecho. */
const mountainClimber: Anim = {
  dur: 620,
  headR: 11,
  a: {
    limbs: [
      [[58, 123], [62, 108], [68, 97]],
      [[68, 97], [126, 107]], // torso
      [[126, 107], [156, 116], [176, 123]], // pierna extendida
      [[126, 107], [132, 112], [116, 118]], // rodilla al pecho
    ],
    head: [51, 94],
  },
  b: {
    limbs: [
      [[58, 123], [62, 108], [68, 97]],
      [[68, 97], [126, 107]],
      [[126, 107], [136, 114], [120, 119]],
      [[126, 107], [154, 114], [174, 122]],
    ],
    head: [51, 94],
  },
};

/** Hollow hold: isométrico, sólo respira. */
const hollow: Anim = {
  dur: 1900,
  headR: 11,
  a: {
    limbs: [
      [[118, 112], [82, 98]], // cadera, hombro
      [[118, 112], [148, 102], [176, 94]], // piernas estiradas
      [[86, 96], [70, 82]], // brazos por encima de la cabeza
    ],
    head: [72, 90],
  },
  b: {
    limbs: [
      [[118, 114], [82, 101]],
      [[118, 114], [148, 105], [176, 98]],
      [[86, 99], [70, 86]],
    ],
    head: [72, 93],
  },
};

/** Plancha: isométrico, sólo respira. */
const plank: Anim = {
  dur: 2100,
  headR: 11,
  a: {
    limbs: [
      [[62, 123], [64, 110], [70, 100]],
      [[70, 100], [126, 109], [174, 120]],
    ],
    head: [52, 96],
  },
  b: {
    limbs: [
      [[62, 123], [64, 110], [70, 102]],
      [[70, 102], [126, 112], [174, 121]],
    ],
    head: [52, 98],
  },
};

/** Plancha lateral: apoyado en el codo, el brazo de arriba sube. */
const sidePlank: Anim = {
  dur: 2100,
  headR: 11,
  a: {
    limbs: [
      [[58, 123], [70, 104]], // antebrazo apoyado
      [[70, 104], [124, 114], [174, 123]], // cuerpo en diagonal
      [[70, 104], [74, 82]], // brazo libre arriba
    ],
    head: [58, 96],
  },
  b: {
    limbs: [
      [[58, 123], [70, 106]],
      [[70, 106], [124, 116], [174, 123]],
      [[70, 106], [76, 85]],
    ],
    head: [58, 98],
  },
};

/** Dead bug: brazo y pierna contrarios se estiran y vuelven. */
const deadBug: Anim = {
  dur: 1400,
  headR: 11,
  a: {
    limbs: [
      [[70, 116], [118, 116]],
      [[118, 116], [136, 94], [150, 100]], // rodilla arriba a 90°
      [[76, 116], [74, 92]], // brazo vertical
    ],
    head: [56, 112],
  },
  b: {
    limbs: [
      [[70, 116], [118, 116]],
      [[118, 116], [148, 110], [176, 114]], // pierna estirada
      [[76, 116], [52, 102]], // brazo por encima de la cabeza
    ],
    head: [56, 112],
  },
};

/** Russian twist / oblicuos sentado: el tronco gira de lado a lado. */
const twist: Anim = {
  dur: 900,
  headR: 11,
  a: {
    limbs: [
      [[104, 116], [96, 86]], // cadera, hombro
      [[104, 116], [136, 102], [152, 121]], // piernas dobladas
      [[98, 92], [74, 84]], // manos a la izquierda
    ],
    head: [92, 74],
  },
  b: {
    limbs: [
      [[104, 116], [100, 86]],
      [[104, 116], [136, 102], [152, 121]],
      [[100, 92], [124, 88]], // manos a la derecha
    ],
    head: [98, 74],
  },
};

// ─── Bloques que no son fuerza ──────────────────────────────────────────────

/** Caminata rápida: brazos y piernas alternando. */
const walk: Anim = {
  dur: 620,
  headR: 11,
  a: {
    limbs: [
      [[110, 100], [110, 66]], // cadera, hombro
      [[110, 100], [98, 112], [92, 123]], // pierna adelante
      [[110, 100], [122, 112], [130, 123]], // pierna atrás
      [[110, 72], [122, 88]], // brazo atrás
      [[110, 72], [98, 88]], // brazo adelante
    ],
    head: [110, 55],
  },
  b: {
    limbs: [
      [[110, 100], [110, 66]],
      [[110, 100], [122, 112], [130, 123]],
      [[110, 100], [98, 112], [92, 123]],
      [[110, 72], [98, 88]],
      [[110, 72], [122, 88]],
    ],
    head: [110, 55],
  },
};

/** Respiración: figura sentada y un halo que se expande. */
const breath: Anim = {
  dur: 2600,
  headR: 11,
  a: {
    limbs: [
      [[104, 112], [104, 80]], // cadera, hombro
      [[104, 112], [136, 116], [156, 112]], // piernas cruzadas
      [[104, 88], [126, 100]], // brazo sobre la rodilla
    ],
    head: [104, 68],
    aura: { c: [110, 92], r: 30 },
  },
  b: {
    limbs: [
      [[104, 110], [104, 76]],
      [[104, 110], [136, 115], [156, 111]],
      [[104, 85], [126, 98]],
    ],
    head: [104, 64],
    aura: { c: [110, 92], r: 52 },
  },
};

/** Kegel: contracción corta, halo chico que pulsa. */
const kegel: Anim = {
  dur: 1100,
  headR: 11,
  a: {
    limbs: [
      [[104, 112], [104, 80]],
      [[104, 112], [136, 116], [156, 112]],
      [[104, 88], [126, 100]],
    ],
    head: [104, 68],
    aura: { c: [106, 108], r: 14 },
  },
  b: {
    limbs: [
      [[104, 110], [104, 78]],
      [[104, 110], [136, 115], [156, 111]],
      [[104, 86], [126, 99]],
    ],
    head: [104, 66],
    aura: { c: [106, 108], r: 26 },
  },
};

/** Entrada en calor: movilidad de brazos y cadera. */
const warmup: Anim = {
  dur: 1000,
  headR: 11,
  a: {
    limbs: [
      [[110, 123], [110, 100], [110, 92]],
      [[110, 92], [110, 62]],
      [[110, 70], [86, 60]], // brazo arriba
      [[110, 70], [132, 84]], // brazo abajo
    ],
    head: [110, 51],
  },
  b: {
    limbs: [
      [[110, 123], [110, 100], [110, 92]],
      [[110, 92], [110, 62]],
      [[110, 70], [88, 86]],
      [[110, 70], [130, 56]],
    ],
    head: [110, 51],
  },
};

/** Revisión de la semana / descanso: figura parada, respiración mínima. */
const rest: Anim = {
  dur: 2400,
  headR: 11,
  a: {
    limbs: [
      [[110, 123], [110, 100], [110, 92]],
      [[110, 92], [110, 62]],
      [[110, 72], [104, 94]],
      [[110, 72], [118, 94]],
    ],
    head: [110, 51],
  },
  b: {
    limbs: [
      [[110, 123], [110, 99], [110, 90]],
      [[110, 90], [110, 60]],
      [[110, 70], [103, 92]],
      [[110, 70], [119, 92]],
    ],
    head: [110, 49],
  },
};

export const ANIMS = {
  pushup,
  floorPress,
  pikePushup,
  squat,
  bulgarian,
  hinge,
  bridge,
  row,
  legRaise,
  mountainClimber,
  hollow,
  plank,
  sidePlank,
  deadBug,
  twist,
  walk,
  breath,
  kegel,
  warmup,
  rest,
} as const;

export type AnimKey = keyof typeof ANIMS;
