import type { AnimKey } from './anims';
import type { BlockKind } from '../theme';

export type Exercise = {
  name: string;
  anim: AnimKey;
  cue?: string;
  /** Si es true, la ficha permite anotar peso y repeticiones. */
  tracked?: boolean;
};

/**
 * Catálogo de ejercicios. La clave es el id estable: el historial de pesos se
 * guarda por id, así "Flexiones" del lunes y del jueves comparten progresión.
 */
const RAW_EXERCISES = {
  warmup: {
    name: 'Entrada en calor',
    anim: 'warmup',
    cue: 'Movilidad de hombro, cadera y tobillo. Activación suave, sin llegar al esfuerzo.',
  },
  goblet_squat: {
    name: 'Sentadilla goblet',
    anim: 'squat',
    cue: 'Mancuerna al pecho, pecho arriba. Cuando llegues a 12 limpias, subí el peso.',
    tracked: true,
  },
  floor_press: {
    name: 'Press de pecho en el piso',
    anim: 'floorPress',
    cue: 'Acostado, los codos rozan el piso abajo. Bajá lento, empujá firme.',
    tracked: true,
  },
  rdl: {
    name: 'Peso muerto rumano',
    anim: 'hinge',
    cue: 'Cadera atrás, espalda recta, rodillas apenas flexionadas. Se siente atrás del muslo.',
    tracked: true,
  },
  pushups: {
    name: 'Flexiones',
    anim: 'pushup',
    cue: 'Dejá 1 repetición en reserva. Progresión: mesa → rodillas → piso → pies elevados.',
    tracked: true,
  },
  db_row: {
    name: 'Remo con mancuerna',
    anim: 'row',
    cue: 'Por brazo. Codo pegado al cuerpo, tirá hacia la cadera.',
    tracked: true,
  },
  bulgarian: {
    name: 'Sentadilla búlgara',
    anim: 'bulgarian',
    cue: 'Por pierna. Pie de atrás sobre una silla, bajá vertical.',
    tracked: true,
  },
  glute_bridge: {
    name: 'Puente de glúteos',
    anim: 'bridge',
    cue: 'Apretá arriba 1 segundo. Podés apoyar una mancuerna sobre la cadera.',
    tracked: true,
  },
  pike_pushup: {
    name: 'Flexiones de pica',
    anim: 'pikePushup',
    cue: 'Cadera alta, la cabeza baja entre las manos. Empuje de hombro.',
    tracked: true,
  },
  leg_raise: { name: 'Elevación de piernas', anim: 'legRaise', cue: 'Bajá lento, sin arquear la espalda.' },
  mountain: { name: 'Escaladores', anim: 'mountainClimber', cue: 'Por pierna. Cadera baja, ritmo parejo.' },
  hollow: { name: 'Hollow hold', anim: 'hollow', cue: 'Lumbar pegada al piso. Si duele la espalda, subí las piernas.' },
  plank: { name: 'Plancha', anim: 'plank', cue: 'Glúteo apretado, cadera en línea. Respirá.' },
  dead_bug: { name: 'Dead bug', anim: 'deadBug', cue: 'Por lado. Brazo y pierna contrarios, lumbar siempre apoyada.' },
  oblique_sit: { name: 'Oblicuos sentado', anim: 'twist', cue: 'Por lado. Giro controlado, sin tirón.' },
  russian_twist: { name: 'Russian twist', anim: 'twist', cue: 'Pies apenas levantados si podés. Podés sostener una mancuerna.' },
  side_plank: { name: 'Plancha lateral', anim: 'sidePlank', cue: 'Por lado. Cadera bien arriba, hombro sobre el codo.' },
  walk: { name: 'Caminata rápida', anim: 'walk', cue: 'Ritmo al que podés hablar pero no cantar. Nariz para inhalar.' },
  breath: { name: 'Meditación / respiración', anim: 'breath', cue: 'Inhalá 4 s, sostené 2 s, exhalá 6 s.' },
  kegel: { name: 'Kegel + respiración', anim: 'kegel', cue: 'Contraé 5 s, soltá 5 s. El piso pélvico se afloja al exhalar.' },
  kegel_mobility: { name: 'Kegel (movilidad)', anim: 'kegel', cue: 'Versión suave: contracciones cortas, sin forzar.' },
  stop_start: { name: 'Práctica de parar y arrancar', anim: 'kegel', cue: 'Frená antes del punto de no retorno, respirá, retomá.' },
  review: { name: 'Revisión de la semana', anim: 'rest', cue: '¿Subiste algún peso? ¿Cumpliste las caminatas? Anotá qué ajustar.' },
} as const;

export type ExerciseId = keyof typeof RAW_EXERCISES;

export const EXERCISES: Record<ExerciseId, Exercise> = RAW_EXERCISES;

export type Item = { ex: ExerciseId; sets?: string };

export type Block = {
  id: string;
  title: string;
  kind: BlockKind;
  meta?: string;
  items: Item[];
};

export type Day = {
  key: string;
  /** 1 = lunes … 7 = domingo (ISO). */
  iso: number;
  label: string;
  short: string;
  title: string;
  blocks: Block[];
};

export const WEEK: Day[] = [
  {
    key: 'mon',
    iso: 1,
    label: 'Lunes',
    short: 'L',
    title: 'Fuerza A · pecho + pierna',
    blocks: [
      {
        id: 'warmup',
        title: 'Entrada en calor',
        kind: 'warmup',
        meta: '5 min',
        items: [{ ex: 'warmup', sets: 'movilidad + activación' }],
      },
      {
        id: 'strength',
        title: 'Fuerza',
        kind: 'strength',
        items: [
          { ex: 'goblet_squat', sets: '4 × 8–12' },
          { ex: 'floor_press', sets: '4 × 8–12' },
          { ex: 'rdl', sets: '3 × 10–12' },
          { ex: 'pushups', sets: '3 × máx' },
          { ex: 'db_row', sets: '3 × 10–12 por brazo' },
        ],
      },
      {
        id: 'abs',
        title: 'Abdominales',
        kind: 'abs',
        items: [
          { ex: 'leg_raise', sets: '3 × 10–15' },
          { ex: 'mountain', sets: '3 × 20 por pierna' },
          { ex: 'hollow', sets: '3 × 15–25 s' },
          { ex: 'plank', sets: '3 × 30–45 s' },
        ],
      },
      {
        id: 'night',
        title: 'Noche',
        kind: 'kegel',
        meta: '15 min',
        items: [{ ex: 'kegel', sets: 'Kegel + respiración' }],
      },
    ],
  },
  {
    key: 'tue',
    iso: 2,
    label: 'Martes',
    short: 'M',
    title: 'Capacidad torácica',
    blocks: [
      {
        id: 'walk',
        title: 'Caminata',
        kind: 'walk',
        meta: 'hueco 10–13 h',
        items: [{ ex: 'walk', sets: '30–40 min' }],
      },
      { id: 'night', title: 'Noche', kind: 'kegel', meta: '15 min', items: [{ ex: 'kegel', sets: 'Kegel' }] },
    ],
  },
  {
    key: 'wed',
    iso: 3,
    label: 'Miércoles',
    short: 'M',
    title: 'Día largo · liviano',
    blocks: [
      {
        id: 'breath',
        title: 'Respiración',
        kind: 'breath',
        meta: '5 min',
        items: [{ ex: 'breath', sets: '5 min' }],
      },
      {
        id: 'night',
        title: 'Noche',
        kind: 'kegel',
        meta: '15 min',
        items: [{ ex: 'kegel_mobility', sets: 'Kegel (movilidad)' }],
      },
    ],
  },
  {
    key: 'thu',
    iso: 4,
    label: 'Jueves',
    short: 'J',
    title: 'Fuerza B · pierna + pecho',
    blocks: [
      {
        id: 'warmup',
        title: 'Entrada en calor',
        kind: 'warmup',
        meta: '5 min',
        items: [{ ex: 'warmup', sets: 'movilidad + activación' }],
      },
      {
        id: 'strength',
        title: 'Fuerza',
        kind: 'strength',
        items: [
          { ex: 'bulgarian', sets: '3 × 8–10 por pierna' },
          { ex: 'pushups', sets: '4 × 8–12' },
          { ex: 'glute_bridge', sets: '3 × 12–15' },
          { ex: 'pike_pushup', sets: '3 × 5–8' },
          { ex: 'db_row', sets: '3 × 10–12 por brazo' },
        ],
      },
      {
        id: 'abs',
        title: 'Abdominales',
        kind: 'abs',
        items: [
          { ex: 'dead_bug', sets: '3 × 8 por lado' },
          { ex: 'oblique_sit', sets: '3 × 15 por lado' },
          { ex: 'russian_twist', sets: '3 × 20' },
          { ex: 'side_plank', sets: '2 × 20–30 s por lado' },
        ],
      },
      {
        id: 'night',
        title: 'Noche',
        kind: 'kegel',
        meta: '15 min',
        items: [{ ex: 'kegel', sets: 'Kegel + respiración' }],
      },
    ],
  },
  {
    key: 'fri',
    iso: 5,
    label: 'Viernes',
    short: 'V',
    title: 'Capacidad torácica',
    blocks: [
      { id: 'walk', title: 'Caminata', kind: 'walk', meta: 'tarde', items: [{ ex: 'walk', sets: '30–40 min' }] },
      { id: 'night', title: 'Noche', kind: 'kegel', meta: '15 min', items: [{ ex: 'kegel', sets: 'Kegel' }] },
    ],
  },
  {
    key: 'sat',
    iso: 6,
    label: 'Sábado',
    short: 'S',
    title: 'Opcional · volumen extra',
    blocks: [
      {
        id: 'pump',
        title: 'Bombeo pecho + pierna',
        kind: 'strength',
        meta: '3 vueltas',
        items: [
          { ex: 'pushups', sets: '3 vueltas' },
          { ex: 'goblet_squat', sets: '3 vueltas' },
          { ex: 'glute_bridge', sets: '3 vueltas' },
        ],
      },
      {
        id: 'abs',
        title: 'Abs a elección',
        kind: 'abs',
        meta: '2–3 ejercicios',
        items: [
          { ex: 'leg_raise', sets: 'a elección' },
          { ex: 'russian_twist', sets: 'a elección' },
          { ex: 'plank', sets: 'a elección' },
        ],
      },
      { id: 'night', title: 'Noche', kind: 'kegel', meta: '15 min', items: [{ ex: 'kegel', sets: 'Kegel' }] },
    ],
  },
  {
    key: 'sun',
    iso: 7,
    label: 'Domingo',
    short: 'D',
    title: 'Cierre + descanso',
    blocks: [
      { id: 'review', title: 'Cierre', kind: 'review', items: [{ ex: 'review' }] },
      { id: 'breath', title: 'Meditación', kind: 'breath', meta: '10 min', items: [{ ex: 'breath', sets: '10 min' }] },
      {
        id: 'night',
        title: 'Noche',
        kind: 'kegel',
        items: [
          { ex: 'kegel', sets: 'Kegel + respiración' },
          { ex: 'stop_start', sets: 'parar y arrancar' },
        ],
      },
    ],
  },
];

/** Clave única de un ejercicio dentro del día (un mismo ejercicio puede repetirse en dos bloques). */
export const itemKey = (day: Day, block: Block, item: Item) => `${day.key}.${block.id}.${item.ex}`;
