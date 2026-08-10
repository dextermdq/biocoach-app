# BioCoach

App de entrenamiento personal. Semana fija de lunes a domingo, con animaciones de
cada movimiento y registro de pesos para forzar la progresión.

## Usarla ahora: https://dextermdq.github.io/biocoach-app/

Abrí ese link en el celular. Para que quede como una app en la pantalla de inicio:

- **Android (Chrome):** menú ⋮ → *Agregar a pantalla principal*.
- **iPhone (Safari):** compartir → *Agregar a inicio*.

Abre a pantalla completa, sin la barra del navegador. Los datos (ejercicios hechos,
pesos) se guardan en ese navegador: si la usás también con Expo Go, cada una lleva
su propio registro por separado. Necesita conexión para abrir.

**Ojo: la versión web no manda avisos.** Para los recordatorios hay que usar la app
instalada, ver *Avisos* más abajo.

### Publicar cambios

```
npm run build:web
git add -A && git commit -m "..." && git push
```

GitHub Pages sirve la carpeta `docs/` de `main`. Tarda un minuto en actualizarse.

## Probarla en el celular con Expo Go

1. Instalá **Expo Go** desde Play Store / App Store.
2. En la compu, dentro de esta carpeta:
   ```
   npm start
   ```
3. Escaneá el QR con el celu (Android: desde Expo Go; iPhone: con la cámara).
   La compu y el celular tienen que estar en la misma red WiFi.

Si la red no coopera (WiFi con aislamiento de clientes, VPN):

```
npx expo start --tunnel
```

Para verla en la compu, `npm run web`.

## Qué hay hecho (v1 lite)

- Vista semanal, abre en el día de hoy.
- Bloques del día con sus ejercicios, series y repeticiones.
- Animación de cada movimiento: figura de línea, dos poses interpoladas en loop.
- Marcar cada ejercicio como hecho, con contador del día.
- Registro de peso y repeticiones por serie, historial y gráfico de progresión.
- Tracker de agua: 8 vasos por día, se reinicia solo cada día.
- Meditación guiada de 3 / 5 / 10 min: círculo que respira (4 s inhalar, 2 s
  sostener, 6 s exhalar) y las frases de guía rotando por ciclo.
- Avisos al celular: entrenar, agua y Kegel de la noche (sólo app instalada).
- Notas de método (comida, progresión, abs, correr, aguante).

Todo se guarda en el celular (AsyncStorage). No hay servidor ni login.

## Avisos

La campana del encabezado abre los recordatorios. Tres, cada uno con su horario:

- **Entrenar** — un aviso por día, con el título del día (fuerza, caminata, cierre).
  Se elige la hora y en qué días avisa. Por defecto 18:00, de lunes a viernes.
- **Agua** — varios avisos por día, editables y se pueden sumar o sacar.
  Por defecto 10, 13, 16 y 19 h.
- **Kegel de la noche** — todos los días. Por defecto 22:00.

Son **notificaciones locales**: las agenda el propio celular. Llegan sin internet y
con la app cerrada, y no hay servidor ni cuenta de por medio. La contra es que sólo
existen en la app instalada:

| Dónde                        | ¿Avisos? |
| ---------------------------- | -------- |
| Web (GitHub Pages / pantalla de inicio) | No. El navegador no puede avisar si no está abierto. |
| Expo Go                      | Sí. Sirve para probarlos hoy mismo. |
| APK instalado (EAS build)    | Sí. Es la forma definitiva. |

En la web la pantalla de avisos lo dice y deja configurar los horarios igual: quedan
guardados para cuando abras la app instalada en ese mismo dispositivo.

En Android, la primera vez que prendés un aviso el sistema pide permiso. Si lo
negaste antes, la pantalla ofrece un botón para abrir los ajustes del sistema. El
botón *Probar un aviso* manda uno a los 5 segundos para verificar que llegan.

Si el ahorro de batería del teléfono es agresivo (Xiaomi, Samsung y Huawei suelen
serlo), Android puede atrasar los avisos unos minutos o directamente comérselos:
en ese caso hay que sacar BioCoach de la optimización de batería.

## Cómo está armado

```
App.tsx                        vista semanal, tira de días, notas
src/theme.ts                   paleta, tipografías, radios
src/data/program.ts            catálogo de ejercicios + semana
src/data/anims.ts              las poses de cada figura animada
src/data/notes.ts              textos de método
src/lib/store.tsx              estado persistente (checks + logs + avisos)
src/lib/date.ts                fechas locales, sin UTC
src/lib/reminders.ts           qué avisos hay y a qué hora (lógica pura)
src/lib/notify.native.ts       programa los avisos en el celular
src/lib/notify.web.ts          en el navegador no hay avisos: no hace nada
src/components/StickFigure.tsx motor de animación SVG
src/components/ExerciseSheet.tsx  ficha del ejercicio y registro
src/components/ProgressChart.tsx  gráfico de progresión
src/components/WaterTracker.tsx   vasos de agua del día
src/components/Meditation.tsx     meditación guiada (guion y círculo)
src/components/Reminders.tsx      pantalla de avisos (switches y horarios)
```

### Agregar o corregir una animación

En `src/data/anims.ts` cada ejercicio son dos poses (`a` y `b`) que se interpolan
punto a punto. Coordenadas sobre un lienzo de 220×150, con el piso en y=123.

Regla dura: **un mismo miembro tiene que tener la misma cantidad de puntos en `a`
y en `b`**, si no la interpolación no cierra.

### Instalar la app de verdad (sin Expo Go)

Es lo que hace falta para tener los avisos sin depender de la compu.

```
npm install -g eas-cli
eas login                 # cuenta de Expo, gratis
eas init                  # engancha el proyecto (una sola vez)
eas build --platform android --profile preview
```

Tarda unos 15 minutos y se hace en la nube. Al terminar da un link con el `.apk`:
se abre desde el celular, Android pide permitir instalar de esa fuente y queda como
una app más. `eas.json` ya trae el perfil `preview` configurado para que salga apk y
no un `.aab` (que sólo sirve para publicar en Play Store).

Cada cambio de código necesita un build nuevo. Lo que no toca código nativo se puede
mandar con `eas update`, pero eso requiere configurar OTA aparte.

### Falta (siguiente vuelta)

- Sincronización con el calendario del celular (sólo tiene sentido en la app instalada).

## Aviso

Es un plan de entrenamiento propio, no una indicación médica. Lo que tenga que ver
con medicación lo define el médico.
