/**
 * Capa que habla con el sistema de notificaciones (Android / iOS).
 *
 * Son notificaciones **locales**: las programa el celular, no hay servidor ni
 * push. Por eso funcionan sin internet y con la app cerrada, pero sólo en la
 * app instalada — en el navegador no existen (ver `notify.web.ts`).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Schedule } from './reminders';

const CHANNEL = 'reminders';
const PREFIX = 'bc:';

// Si llega un aviso con la app abierta, que igual se vea.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const isSupported = () => true;

let channelReady = false;

async function ensureChannel() {
  // Android 8+ no muestra nada que no tenga canal.
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Recordatorios',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2F6D5F',
  });
  channelReady = true;
}

/** Pide el permiso si hace falta. Devuelve si quedó concedido. */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Si el permiso ya está concedido, sin abrir ningún diálogo. */
export async function hasPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
}

async function cancelOurs() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((r) => r.identifier?.startsWith(PREFIX) || (r.content?.data as any)?.bc === true)
      .map((r) => Notifications.cancelScheduledNotificationAsync(r.identifier).catch(() => {}))
  );
}

/**
 * Deja programado exactamente lo que dice `list`: borra los avisos de la app y
 * vuelve a crearlos. Reprogramar de cero es más barato que diffear, y evita
 * duplicados si el sistema se quedó con alguno viejo.
 */
export async function applySchedules(list: Schedule[]): Promise<void> {
  await ensureChannel();
  await cancelOurs();

  for (const s of list) {
    const trigger =
      s.isoDay === undefined
        ? {
            type: Notifications.SchedulableTriggerInputTypes.DAILY as const,
            hour: s.hour,
            minute: s.minute,
            channelId: CHANNEL,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY as const,
            // ISO manda 1 = lunes … 7 = domingo; acá 1 = domingo … 7 = sábado.
            weekday: s.isoDay === 7 ? 1 : s.isoDay + 1,
            hour: s.hour,
            minute: s.minute,
            channelId: CHANNEL,
          };

    await Notifications.scheduleNotificationAsync({
      identifier: s.id,
      content: { title: s.title, body: s.body, data: { bc: true } },
      trigger,
    });
  }
}

/** Cuántos avisos de la app quedaron programados. Para mostrarlo en la UI. */
export async function scheduledCount(): Promise<number> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.filter((r) => r.identifier?.startsWith(PREFIX) || (r.content?.data as any)?.bc === true)
    .length;
}

/** Un aviso de prueba a los pocos segundos, para verificar que llegan. */
export async function sendTest(): Promise<void> {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: `${PREFIX}test`,
    content: { title: 'BioCoach', body: 'Listo: los avisos llegan.', data: { bc: true } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL,
      repeats: false,
    },
  });
}
