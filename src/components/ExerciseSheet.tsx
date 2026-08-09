import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { ANIMS } from '../data/anims';
import { EXERCISES, type ExerciseId } from '../data/program';
import { shortFromYmd } from '../lib/date';
import { bestOf, groupByDate, useStore } from '../lib/store';
import { C, F, R } from '../theme';
import ProgressChart, { type Point } from './ProgressChart';
import StickFigure from './StickFigure';

export type SheetTarget = {
  exId: ExerciseId;
  sets?: string;
  key: string;
  color: string;
};

/** Acepta "7,5" y "7.5". Devuelve null si no es un número usable. */
function num(s: string): number | null {
  const v = Number(s.replace(',', '.').trim());
  return Number.isFinite(v) && v >= 0 ? v : null;
}

export default function ExerciseSheet({
  target,
  date,
  onClose,
}: {
  target: SheetTarget | null;
  date: string;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const { logs, addLog, removeLog, isDone, toggle } = useStore();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const ex = target ? EXERCISES[target.exId] : null;
  const entries = target ? logs[target.exId] ?? [] : [];

  const todays = useMemo(() => entries.filter((e) => e.date === date), [entries, date]);

  const sessions = useMemo(() => groupByDate(entries), [entries]);

  const chart = useMemo<Point[]>(
    () =>
      sessions.map(([d, list]) => {
        const b = bestOf(list);
        // Con peso corporal la progresión son las repeticiones.
        return { date: d, value: b.weight > 0 ? b.weight : b.reps, label: shortFromYmd(d) };
      }),
    [sessions]
  );

  const usesWeight = entries.some((e) => e.weight > 0);
  const previous = sessions.length ? sessions.filter(([d]) => d !== date).slice(-1)[0] : null;

  const submit = () => {
    if (!target) return;
    const r = num(reps);
    if (r === null || r === 0) return;
    const w = num(weight) ?? 0;
    addLog(target.exId, { date, weight: w, reps: Math.round(r) });
    setReps('');
    // El peso se mantiene: casi siempre la serie siguiente usa el mismo.
  };

  const done = target ? isDone(date, target.key) : false;

  return (
    <Modal visible={!!target} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: C.paper }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {target && ex ? (
          <ScrollView
            contentContainerStyle={{ padding: 18, paddingBottom: 48 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{ex.name}</Text>
                {target.sets ? <Text style={[s.sets, { color: target.color }]}>{target.sets}</Text> : null}
              </View>
              <Pressable onPress={onClose} hitSlop={12} style={s.close}>
                <Text style={s.closeTxt}>Cerrar</Text>
              </Pressable>
            </View>

            <View style={s.stage}>
              <StickFigure anim={ANIMS[ex.anim]} size={Math.min(width - 60, 330)} color={target.color} />
            </View>

            {ex.cue ? <Text style={s.cue}>{ex.cue}</Text> : null}

            <Pressable
              onPress={() => toggle(date, target.key)}
              style={[s.doneBtn, done && { backgroundColor: target.color, borderColor: target.color }]}
            >
              <Text style={[s.doneTxt, done && { color: '#fff' }]}>
                {done ? '✓  Hecho hoy' : 'Marcar como hecho'}
              </Text>
            </Pressable>

            {ex.tracked ? (
              <>
                <Text style={s.section}>Registro de hoy</Text>

                <View style={s.inputRow}>
                  <View style={s.field}>
                    <Text style={s.label}>PESO (KG)</Text>
                    <TextInput
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={C.ground}
                      style={s.input}
                      returnKeyType="next"
                    />
                  </View>
                  <View style={s.field}>
                    <Text style={s.label}>REPS</Text>
                    <TextInput
                      value={reps}
                      onChangeText={setReps}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={C.ground}
                      style={s.input}
                      returnKeyType="done"
                      onSubmitEditing={submit}
                    />
                  </View>
                  <Pressable
                    onPress={submit}
                    style={[s.addBtn, { backgroundColor: target.color }, !num(reps) && s.addBtnOff]}
                  >
                    <Text style={s.addTxt}>Anotar</Text>
                  </Pressable>
                </View>

                <Text style={s.hint}>Dejá el peso en 0 si es peso corporal.</Text>

                {todays.length ? (
                  <View style={s.chips}>
                    {todays.map((e, i) => (
                      <Pressable key={e.at} onLongPress={() => removeLog(target.exId, e.at)} style={s.chip}>
                        <Text style={s.chipNum}>{i + 1}</Text>
                        <Text style={s.chipTxt}>
                          {e.weight > 0 ? `${e.weight} kg × ${e.reps}` : `${e.reps} reps`}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {todays.length ? <Text style={s.hint}>Mantené apretada una serie para borrarla.</Text> : null}

                {previous ? (
                  <View style={s.prev}>
                    <Text style={s.prevLabel}>SESIÓN ANTERIOR · {shortFromYmd(previous[0])}</Text>
                    <Text style={s.prevVal}>
                      {previous[1]
                        .map((e) => (e.weight > 0 ? `${e.weight}×${e.reps}` : `${e.reps}`))
                        .join('   ')}
                    </Text>
                    <Text style={s.prevHint}>Igualala o superala. Ahí está el crecimiento.</Text>
                  </View>
                ) : null}

                <Text style={s.section}>Progresión</Text>
                <View style={s.card}>
                  <ProgressChart
                    points={chart}
                    width={width - 72}
                    unit={usesWeight ? ' kg' : ' reps'}
                    color={target.color}
                  />
                </View>

                {sessions.length > 1 ? (
                  <>
                    <Text style={s.section}>Historial</Text>
                    <View style={s.card}>
                      {[...sessions].reverse().map(([d, list]) => (
                        <View key={d} style={s.histRow}>
                          <Text style={s.histDate}>{shortFromYmd(d)}</Text>
                          <Text style={s.histVal}>
                            {list.map((e) => (e.weight > 0 ? `${e.weight}×${e.reps}` : `${e.reps}`)).join('  ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontFamily: F.title, fontSize: 24, color: C.ink, letterSpacing: -0.4 },
  sets: { fontFamily: F.mono, fontSize: 13, marginTop: 4 },
  close: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: R.sm, backgroundColor: C.card },
  closeTxt: { fontFamily: F.bodyMed, fontSize: 13, color: C.muted },
  stage: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    // Alto fijo: si no, la tarjeta salta de tamaño según si el ejercicio es de pie o acostado.
    height: 200,
    marginTop: 16,
  },
  cue: { fontFamily: F.body, fontSize: 14, lineHeight: 21, color: C.muted, marginTop: 14 },
  doneBtn: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: C.hairline,
    backgroundColor: C.card,
    borderRadius: R.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneTxt: { fontFamily: F.bodySemi, fontSize: 15, color: C.ink },
  section: {
    fontFamily: F.titleSemi,
    fontSize: 15,
    color: C.ink,
    marginTop: 26,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  field: { flex: 1 },
  label: { fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: 0.6, marginBottom: 5 },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: F.monoBold,
    fontSize: 18,
    color: C.ink,
  },
  addBtn: { borderRadius: R.md, paddingHorizontal: 16, paddingVertical: 13 },
  addBtnOff: { opacity: 0.35 },
  addTxt: { fontFamily: F.bodySemi, fontSize: 14, color: '#fff' },
  hint: { fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  chipNum: { fontFamily: F.mono, fontSize: 10, color: C.muted },
  chipTxt: { fontFamily: F.monoBold, fontSize: 13, color: C.ink },
  prev: {
    marginTop: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.lg,
    padding: 14,
  },
  prevLabel: { fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: 0.6 },
  prevVal: { fontFamily: F.monoBold, fontSize: 17, color: C.ink, marginTop: 6 },
  prevHint: { fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 6 },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.lg,
    padding: 14,
  },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  histDate: { fontFamily: F.mono, fontSize: 12, color: C.muted },
  histVal: { fontFamily: F.monoBold, fontSize: 13, color: C.ink },
});
