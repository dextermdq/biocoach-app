/**
 * Versión web: no hace nada.
 *
 * El navegador sólo puede mostrar avisos programados con un servidor de push
 * detrás; sin eso, la app tendría que estar abierta para que sonaran, que es
 * justo lo que un recordatorio no puede pedir. Así que en la web los avisos
 * quedan apagados y la UI lo dice, en vez de prometer algo que no pasa.
 *
 * Este archivo también mantiene `expo-notifications` fuera del bundle web.
 */
import type { Schedule } from './reminders';

export const isSupported = () => false;

export async function ensurePermission(): Promise<boolean> {
  return false;
}

export async function hasPermission(): Promise<boolean> {
  return false;
}

export async function applySchedules(_list: Schedule[]): Promise<void> {}

export async function scheduledCount(): Promise<number> {
  return 0;
}

export async function sendTest(): Promise<void> {}
