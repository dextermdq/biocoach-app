# BioCoach

App de entrenamiento personal. Semana fija de lunes a domingo, con animaciones de
cada movimiento y registro de pesos para forzar la progresión.

## Probarla en el celular

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
- Notas de método (comida, progresión, abs, correr, aguante).

Todo se guarda en el celular (AsyncStorage). No hay servidor ni login.

## Falta (siguiente vuelta)

- Notificaciones locales: entrenar, agua, Kegel de la noche.
- Módulo de meditación guiada con el círculo que respira.
- Tracker de agua.
- Sincronización con el calendario del celular.

## Cómo está armado

```
App.tsx                        vista semanal, tira de días, notas
src/theme.ts                   paleta, tipografías, radios
src/data/program.ts            catálogo de ejercicios + semana
src/data/anims.ts              las poses de cada figura animada
src/data/notes.ts              textos de método
src/lib/store.tsx              estado persistente (checks + logs)
src/lib/date.ts                fechas locales, sin UTC
src/components/StickFigure.tsx motor de animación SVG
src/components/ExerciseSheet.tsx  ficha del ejercicio y registro
src/components/ProgressChart.tsx  gráfico de progresión
```

### Agregar o corregir una animación

En `src/data/anims.ts` cada ejercicio son dos poses (`a` y `b`) que se interpolan
punto a punto. Coordenadas sobre un lienzo de 220×150, con el piso en y=123.

Regla dura: **un mismo miembro tiene que tener la misma cantidad de puntos en `a`
y en `b`**, si no la interpolación no cierra.

### Instalar la app de verdad (sin Expo Go)

```
npx eas build --platform android --profile preview
```

Requiere cuenta de Expo. Tarda y se hace en la nube; deja un `.apk` para instalar.

## Aviso

Es un plan de entrenamiento propio, no una indicación médica. Lo que tenga que ver
con medicación lo define el médico.
