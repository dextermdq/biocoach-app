import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const K_CHECKS = 'bc:checks:v1';
const K_LOGS = 'bc:logs:v1';
const K_WATER = 'bc:water:v1';

/** Vasos por día. */
export const WATER_GOAL = 8;

/** Una serie registrada. */
export type LogEntry = {
  /** YYYY-MM-DD */
  date: string;
  /** kg. 0 = peso corporal. */
  weight: number;
  reps: number;
  /** Marca de tiempo para poder borrar la última sin ambigüedad. */
  at: number;
};

/** clave `${YYYY-MM-DD}|${itemKey}` → hecho */
type Checks = Record<string, boolean>;
/** exerciseId → series registradas, en orden cronológico */
type Logs = Record<string, LogEntry[]>;
/** YYYY-MM-DD → vasos tomados ese día */
type Water = Record<string, number>;

type Store = {
  ready: boolean;
  checks: Checks;
  logs: Logs;
  water: Water;
  isDone: (date: string, key: string) => boolean;
  toggle: (date: string, key: string) => void;
  addLog: (exId: string, entry: Omit<LogEntry, 'at'>) => void;
  removeLog: (exId: string, at: number) => void;
  setWater: (date: string, glasses: number) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [checks, setChecks] = useState<Checks>({});
  const [logs, setLogs] = useState<Logs>({});
  const [water, setWaterState] = useState<Water>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, l, w] = await AsyncStorage.multiGet([K_CHECKS, K_LOGS, K_WATER]);
        if (!alive) return;
        if (c[1]) setChecks(JSON.parse(c[1]));
        if (l[1]) setLogs(JSON.parse(l[1]));
        if (w[1]) setWaterState(JSON.parse(w[1]));
      } catch {
        // Datos corruptos o primer arranque: seguimos con el estado vacío.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Persistimos con un respiro para no escribir en cada tap.
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const persist = useCallback((key: string, value: unknown) => {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
    }, 250);
  }, []);

  const toggle = useCallback(
    (date: string, key: string) => {
      setChecks((prev) => {
        const k = `${date}|${key}`;
        const next = { ...prev };
        if (next[k]) delete next[k];
        else next[k] = true;
        persist(K_CHECKS, next);
        return next;
      });
    },
    [persist]
  );

  const addLog = useCallback(
    (exId: string, entry: Omit<LogEntry, 'at'>) => {
      setLogs((prev) => {
        const list = prev[exId] ?? [];
        const next = { ...prev, [exId]: [...list, { ...entry, at: Date.now() }] };
        persist(K_LOGS, next);
        return next;
      });
    },
    [persist]
  );

  const removeLog = useCallback(
    (exId: string, at: number) => {
      setLogs((prev) => {
        const next = { ...prev, [exId]: (prev[exId] ?? []).filter((e) => e.at !== at) };
        persist(K_LOGS, next);
        return next;
      });
    },
    [persist]
  );

  const setWater = useCallback(
    (date: string, glasses: number) => {
      setWaterState((prev) => {
        const n = Math.max(0, Math.round(glasses));
        const next = { ...prev };
        // No guardamos los ceros: el objeto no crece con un día por cada vez que
        // se abre la app.
        if (n === 0) delete next[date];
        else next[date] = n;
        persist(K_WATER, next);
        return next;
      });
    },
    [persist]
  );

  const value = useMemo<Store>(
    () => ({
      ready,
      checks,
      logs,
      water,
      isDone: (date, key) => !!checks[`${date}|${key}`],
      toggle,
      addLog,
      removeLog,
      setWater,
    }),
    [ready, checks, logs, water, toggle, addLog, removeLog, setWater]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore fuera de StoreProvider');
  return v;
}

/** Series agrupadas por fecha, de la más vieja a la más nueva. */
export function groupByDate(list: LogEntry[]) {
  const map = new Map<string, LogEntry[]>();
  for (const e of list) {
    const arr = map.get(e.date);
    if (arr) arr.push(e);
    else map.set(e.date, [e]);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

/** Mejor serie del día, medida por peso y después por reps. */
export function bestOf(entries: LogEntry[]): LogEntry {
  return entries.reduce((best, e) =>
    e.weight > best.weight || (e.weight === best.weight && e.reps > best.reps) ? e : best
  );
}
