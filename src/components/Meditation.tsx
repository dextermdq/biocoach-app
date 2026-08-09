import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { C, F, R } from '../theme';

const INHALE = 4000;
const HOLD = 2000;
const EXHALE = 6000;
const CYCLE = INHALE + HOLD + EXHALE;

/** Fase del ciclo según los milisegundos transcurridos. */
function phaseAt(ms: number): string {
  const t = ms % CYCLE;
  if (t < INHALE) return 'Inhalá';
  if (t < INHALE + HOLD) return 'Sostené';
  return 'Exhalá';
}

const GUIDE = [
  'Sentate cómodo, la espalda larga y los hombros sueltos.',
  'Sentí el aire entrar tibio por la nariz y salir lento por la boca.',
  'No hay nada que resolver ahora. Solo respirar.',
  'En cada exhalación, aflojá la mandíbula, los hombros, la pelvis.',
  'Si aparece un pensamiento, dejalo pasar como una nube. Volvé al aire.',
  'Bajá una marcha. Tu cuerpo sabe hacer esto solo.',
  'Nada que aprobar, nada que rendir. Solo estás acá.',
  'El piso pélvico se ablanda cada vez que soltás el aire.',
  'Más lento, más suave. No hay apuro.',
  'Llevate esta calma con vos. Así es como se llega tranquilo a lo que importa.',
];

const MINUTES = [3, 5, 10];

function mmss(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Session({ minutes, onDone }: { minutes: number; onDone: () => void }) {
  useKeepAwake();
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(Date.now());
  const total = minutes * 60_000;

  const scale = useSharedValue(0.55);

  useEffect(() => {
    // El círculo late con las mismas duraciones que el reloj de abajo, y los dos
    // arrancan en el mismo instante.
    scale.value = 0.55;
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: INHALE, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: HOLD }),
        withTiming(0.55, { duration: EXHALE, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    return () => cancelAnimation(scale);
  }, [scale]);

  useEffect(() => {
    const id = setInterval(() => {
      const ms = Date.now() - started.current;
      if (ms >= total) {
        clearInterval(id);
        setElapsed(total);
        onDone();
      } else {
        setElapsed(ms);
      }
    }, 200);
    return () => clearInterval(id);
  }, [total, onDone]);

  const circle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const line = GUIDE[Math.floor(elapsed / CYCLE) % GUIDE.length];

  return (
    <>
      <Text style={s.phase}>{phaseAt(elapsed)}</Text>

      <View style={s.stage}>
        <Animated.View style={[s.circle, circle]} />
      </View>

      <Text style={s.guide}>{line}</Text>
      <Text style={s.clock}>{mmss(total - elapsed)}</Text>
    </>
  );
}

export default function Meditation({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [minutes, setMinutes] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  // Cada vez que se abre, arranca de cero.
  useEffect(() => {
    if (visible) {
      setMinutes(null);
      setDone(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.screen}>
        <Pressable onPress={onClose} hitSlop={14} style={s.close}>
          <Text style={s.closeTxt}>{minutes && !done ? 'Terminar' : 'Cerrar'}</Text>
        </Pressable>

        {minutes === null ? (
          <View style={s.center}>
            <Text style={s.title}>Meditación</Text>
            <Text style={s.sub}>Inhalá 4 s, sostené 2 s, exhalá 6 s. Seguí el círculo.</Text>
            <View style={s.picker}>
              {MINUTES.map((m) => (
                <Pressable key={m} onPress={() => setMinutes(m)} style={s.pick}>
                  <Text style={s.pickNum}>{m}</Text>
                  <Text style={s.pickUnit}>min</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : done ? (
          <View style={s.center}>
            <Text style={s.title}>Bien hecho.</Text>
            <Text style={s.sub}>Volvé despacio.</Text>
            <Pressable onPress={onClose} style={s.finish}>
              <Text style={s.finishTxt}>Listo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.center}>
            <Session minutes={minutes} onDone={() => setDone(true)} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const CIRCLE = 220;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.night, paddingHorizontal: 26, paddingVertical: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  close: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.sm },
  closeTxt: { fontFamily: F.bodyMed, fontSize: 14, color: '#7E8F8A' },

  title: { fontFamily: F.title, fontSize: 30, color: '#EAF0ED', letterSpacing: -0.6 },
  sub: { fontFamily: F.body, fontSize: 14, color: '#8FA09B', marginTop: 10, textAlign: 'center' },

  picker: { flexDirection: 'row', gap: 12, marginTop: 34 },
  pick: {
    width: 84,
    paddingVertical: 18,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: '#31403C',
    alignItems: 'center',
  },
  pickNum: { fontFamily: F.monoBold, fontSize: 26, color: '#EAF0ED' },
  pickUnit: { fontFamily: F.mono, fontSize: 11, color: '#7E8F8A', marginTop: 2 },

  phase: { fontFamily: F.title, fontSize: 30, color: '#EAF0ED', letterSpacing: -0.4 },
  stage: { height: CIRCLE + 20, alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: 'rgba(62,117,145,0.30)',
    borderWidth: 2,
    borderColor: 'rgba(120,180,205,0.55)',
  },
  // Alto fijo: las frases tienen largos distintos y si no el círculo se movería.
  guide: {
    fontFamily: F.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#9DAFAA',
    textAlign: 'center',
    height: 66,
  },
  clock: { fontFamily: F.mono, fontSize: 14, color: '#6E807B', marginTop: 6 },

  finish: {
    marginTop: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: '#31403C',
  },
  finishTxt: { fontFamily: F.bodySemi, fontSize: 15, color: '#EAF0ED' },
});
