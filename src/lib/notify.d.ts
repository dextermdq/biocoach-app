/**
 * Tipos de `./notify`. El archivo real lo elige el bundler por plataforma:
 * `notify.native.ts` en el celular, `notify.web.ts` en el navegador.
 */
import type { Schedule } from './reminders';

export declare const isSupported: () => boolean;
export declare function ensurePermission(): Promise<boolean>;
export declare function hasPermission(): Promise<boolean>;
export declare function applySchedules(list: Schedule[]): Promise<void>;
export declare function scheduledCount(): Promise<number>;
export declare function sendTest(): Promise<void>;
