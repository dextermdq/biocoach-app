/**
 * Qué avisos manda la app y a qué hora. Todo lo de acá es lógica pura: la parte
 * que habla con el sistema operativo vive en `notify` (una versión por
 * plataforma).
 */
import { WEEK } from '../data/program';

export type Time = { h: number; m: number };

export type Prefs = {
  /** Entrenar: una hora, y los días ISO (1 = lunes … 7 = domingo) en que avisa. */
  train: { on: boolean; at: Time; days: number[] };
  /** Agua: varios horarios en el día, todos los días. */
  water: { on: boolean; times: Time[] };
  /** Kegel de la noche: todos los días a la misma hora. */
  kegel: { on: boolean; at: Time };
};

export const DEFAULT_PREFS: Prefs = {
  train: { on: false, at: { h: 18, m: 0 }, days: [1, 2, 3, 4, 5] },
  water: {
    on: false,
    times: [
      { h: 10, m: 0 },
      { h: 13, m: 0 },
      { h: 16, m: 0 },
      { h: 19, m: 0 },
    ],
  },
  kegel: { on: false, at: { h: 22, m: 0 } },
};

/** Un aviso listo para programar. Sin `isoDay` es diario. */
export type Schedule = {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  /** 1 = lunes … 7 = domingo. */
  isoDay?: number;
};

const clampTime = (t: unknown): Time => {
  const o = (t ?? {}) as Partial<Time>;
  const h = Number.isFinite(o.h) ? Math.min(23, Math.max(0, Math.trunc(o.h as number))) : 0;
  const m = Number.isFinite(o.m) ? Math.min(59, Math.max(0, Math.trunc(o.m as number))) : 0;
  return { h, m };
};

/**
 * Completa lo que venga del disco con los valores por defecto. Sin esto, un
 * campo agregado más adelante llegaría `undefined` a la UI de quien ya tenía
 * preferencias guardadas.
 */
export function normalizePrefs(raw: unknown): Prefs {
  const p = (raw ?? {}) as Partial<Prefs>;
  const d = DEFAULT_PREFS;
  const times = Array.isArray(p.water?.times) && p.water!.times.length
    ? p.water!.times.map(clampTime)
    : d.water.times;
  const days = Array.isArray(p.train?.days)
    ? p.train!.days.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7)
    : d.train.days;

  return {
    train: { on: !!p.train?.on, at: clampTime(p.train?.at ?? d.train.at), days },
    water: { on: !!p.water?.on, times },
    kegel: { on: !!p.kegel?.on, at: clampTime(p.kegel?.at ?? d.kegel.at) },
  };
}

/** "18:00" */
export const fmtTime = (t: Time) => `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;

/** Suma minutos dando la vuelta al día. */
export function addMinutes(t: Time, delta: number): Time {
  const total = ((t.h * 60 + t.m + delta) % 1440 + 1440) % 1440;
  return { h: Math.floor(total / 60), m: total % 60 };
}

const WATER_BODIES = [
  'Pará 20 segundos y tomá un vaso.',
  'Un vaso ahora y marcalo en la app.',
  'Agua. Después seguís.',
  'Otro vaso, que la meta son 8.',
];

/** La lista completa de avisos que corresponden a estas preferencias. */
export function buildSchedules(prefs: Prefs): Schedule[] {
  const out: Schedule[] = [];

  if (prefs.train.on) {
    for (const iso of prefs.train.days) {
      const day = WEEK.find((d) => d.iso === iso);
      if (!day) continue;
      out.push({
        id: `bc:train:${iso}`,
        title: 'Hora de entrenar',
        // El título del día ya dice si toca fuerza, caminata o respiración.
        body: `${day.label} · ${day.title}`,
        hour: prefs.train.at.h,
        minute: prefs.train.at.m,
        isoDay: iso,
      });
    }
  }

  if (prefs.water.on) {
    prefs.water.times.forEach((t, i) => {
      out.push({
        id: `bc:water:${i}`,
        title: 'Agua',
        body: WATER_BODIES[i % WATER_BODIES.length],
        hour: t.h,
        minute: t.m,
      });
    });
  }

  if (prefs.kegel.on) {
    out.push({
      id: 'bc:kegel',
      title: 'Kegel de la noche',
      body: '15 min. Contraé 5 s, soltá 5 s; el piso pélvico se afloja al exhalar.',
      hour: prefs.kegel.at.h,
      minute: prefs.kegel.at.m,
    });
  }

  return out;
}
