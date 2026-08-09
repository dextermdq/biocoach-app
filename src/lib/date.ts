/** Fecha local en formato YYYY-MM-DD. Nunca usar toISOString(): corre a UTC. */
export function ymd(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Día ISO: 1 = lunes … 7 = domingo. */
export function isoDay(d: Date = new Date()): number {
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

/** Fecha del día ISO pedido dentro de la semana en curso (semana que arranca el lunes). */
export function dateOfIsoDayThisWeek(iso: number, today: Date = new Date()): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d.setDate(d.getDate() + (iso - isoDay(today)));
  return d;
}

const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** "12 ago" */
export function shortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "12 ago" a partir de un YYYY-MM-DD (parseado como fecha local). */
export function shortFromYmd(s: string): string {
  const [y, m, day] = s.split('-').map(Number);
  return shortDate(new Date(y, m - 1, day));
}
