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
- Notas de método (comida, progresión, abs, correr, aguante).

Todo se guarda en el celular (AsyncStorage). No hay servidor ni login.

## Falta (siguiente vuelta)

- Notificaciones locales: entrenar, agua, Kegel de la noche.
- Módulo de meditación guiada con el círculo que respira.
- Sincronización con el calendario del celular.

Las dos primeras sólo tienen sentido en la app instalada: en la versión web no
hay notificaciones programadas ni acceso al calendario.

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
