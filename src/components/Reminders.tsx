import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ensurePermission, hasPermission, isSupported, sendTest } from '../lib/notify';
import { addMinutes, fmtTime, type Prefs, type Time } from '../lib/reminders';
import { useStore } from '../lib/store';
import { C, F, R } from '../theme';

const DAYS: { iso: number; short: string }[] = [
  { iso: 1, short: 'L' },
  { iso: 2, short: 'M' },
  { iso: 3, short: 'M' },
  { iso: 4, short: 'J' },
  { iso: 5, short: 'V' },
  { iso: 6, short: 'S' },
  { iso: 7, short: 'D' },
];

function Head({
  title,
  meta,
  color,
  on,
  onToggle,
}: {
  title: string;
  meta: string;
  color: string;
  on: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={s.cardHead}>
      <View style={[s.bar, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{title}</Text>
        <Text style={s.cardMeta}>{meta}</Text>
      </View>
      <Switch
        value={on}
        onValueChange={onToggle}
        trackColor={{ false: C.ground, true: color }}
        thumbColor="#fff"
      />
    </View>
  );
}

/** Hora con pasos de 15 minutos y de 1 hora. Sin picker nativo: menos piezas. */
function TimeRow({
  value,
  onChange,
  onRemove,
  dim,
}: {
  value: Time;
  onChange: (t: Time) => void;
  onRemove?: () => void;
  dim?: boolean;
}) {
  const step = (delta: number) => () => onChange(addMinutes(value, delta));
  return (
    <View style={s.timeRow}>
      <Pressable onPress={step(-60)} hitSlop={6} style={s.stepBtn}>
        <Text style={s.stepTxt}>−1h</Text>
      </Pressable>
      <Pressable onPress={step(-15)} hitSlop={6} style={s.stepBtn}>
        <Text style={s.stepTxt}>−15</Text>
      </Pressable>
      <Text style={[s.time, dim && { color: C.muted }]}>{fmtTime(value)}</Text>
      <Pressable onPress={step(15)} hitSlop={6} style={s.stepBtn}>
        <Text style={s.stepTxt}>+15</Text>
      </Pressable>
      <Pressable onPress={step(60)} hitSlop={6} style={s.stepBtn}>
        <Text style={s.stepTxt}>+1h</Text>
      </Pressable>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} style={s.removeBtn}>
          <Text style={s.removeTxt}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Reminders({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { prefs, setPrefs } = useStore();
  const supported = isSupported();
  const [blocked, setBlocked] = useState(false);
  const [tested, setTested] = useState(false);

  useEffect(() => {
    if (!visible || !supported) return;
    let alive = true;
    // Si el permiso se revocó desde Ajustes del sistema, el switch prendido
    // estaría mintiendo: lo detectamos al abrir.
    hasPermission().then((ok) => {
      if (!alive) return;
      const wants = prefs.train.on || prefs.water.on || prefs.kegel.on;
      setBlocked(wants && !ok);
    });
    return () => {
      alive = false;
    };
  }, [visible, supported, prefs]);

  const toggle = useCallback(
    async (key: keyof Prefs, on: boolean) => {
      // En la web no hay permiso que pedir: se guarda la preferencia y listo,
      // para que quede configurado cuando abra la app instalada.
      if (on && supported) {
        const ok = await ensurePermission();
        if (!ok) {
          setBlocked(true);
          return;
        }
        setBlocked(false);
      }
      setPrefs((p) => ({ ...p, [key]: { ...p[key], on } }));
    },
    [setPrefs, supported]
  );

  const test = useCallback(async () => {
    if (!(await ensurePermission())) {
      setBlocked(true);
      return;
    }
    await sendTest();
    setTested(true);
    setTimeout(() => setTested(false), 6000);
  }, []);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.paper }} edges={['top', 'bottom']}>
        <View style={s.topBar}>
          <Text style={s.screenTitle}>Avisos</Text>
          <Pressable onPress={onClose} hitSlop={10} style={s.closeBtn}>
            <Text style={s.closeTxt}>Listo</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          {!supported ? (
            <View style={[s.banner, { borderColor: C.terracotta }]}>
              <Text style={s.bannerTitle}>Acá no hay avisos</Text>
              <Text style={s.bannerBody}>
                Estás usando BioCoach en el navegador. Los recordatorios necesitan la app
                instalada en el celular: el navegador sólo puede avisarte si lo tenés abierto.
                {'\n\n'}
                Podés dejar configurados los horarios igual: quedan guardados en este dispositivo.
              </Text>
            </View>
          ) : null}

          {blocked ? (
            <View style={[s.banner, { borderColor: C.terracotta }]}>
              <Text style={s.bannerTitle}>Android está bloqueando los avisos</Text>
              <Text style={s.bannerBody}>
                Hay que habilitarlos a mano para BioCoach.
              </Text>
              <Pressable onPress={() => Linking.openSettings()} style={s.linkBtn}>
                <Text style={s.linkTxt}>Abrir ajustes del sistema</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={s.card}>
            <Head
              title="Entrenar"
              meta="Un aviso por día, con lo que toca ese día"
              color={C.pine}
              on={prefs.train.on}
              onToggle={(v) => toggle('train', v)}
            />
            {prefs.train.on ? (
              <>
                <TimeRow
                  value={prefs.train.at}
                  onChange={(at) => setPrefs((p) => ({ ...p, train: { ...p.train, at } }))}
                />
                <View style={s.chips}>
                  {DAYS.map((d) => {
                    const on = prefs.train.days.includes(d.iso);
                    return (
                      <Pressable
                        key={d.iso}
                        onPress={() =>
                          setPrefs((p) => ({
                            ...p,
                            train: {
                              ...p.train,
                              days: on
                                ? p.train.days.filter((n) => n !== d.iso)
                                : [...p.train.days, d.iso].sort((a, b) => a - b),
                            },
                          }))
                        }
                        style={[s.chip, on && { backgroundColor: C.pine, borderColor: C.pine }]}
                      >
                        <Text style={[s.chipTxt, on && { color: '#fff' }]}>{d.short}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={s.hint}>
                  Martes y viernes son caminata; si te queda mejor otro horario esos días,
                  apagalos acá y avisate aparte.
                </Text>
              </>
            ) : null}
          </View>

          <View style={s.card}>
            <Head
              title="Agua"
              meta={`${prefs.water.times.length} avisos por día, para llegar a 8 vasos`}
              color={C.blue}
              on={prefs.water.on}
              onToggle={(v) => toggle('water', v)}
            />
            {prefs.water.on ? (
              <>
                {prefs.water.times.map((t, i) => (
                  <TimeRow
                    key={i}
                    value={t}
                    onChange={(nt) =>
                      setPrefs((p) => ({
                        ...p,
                        water: { ...p.water, times: p.water.times.map((x, j) => (j === i ? nt : x)) },
                      }))
                    }
                    onRemove={
                      prefs.water.times.length > 1
                        ? () =>
                            setPrefs((p) => ({
                              ...p,
                              water: { ...p.water, times: p.water.times.filter((_, j) => j !== i) },
                            }))
                        : undefined
                    }
                  />
                ))}
                {prefs.water.times.length < 8 ? (
                  <Pressable
                    onPress={() =>
                      setPrefs((p) => ({
                        ...p,
                        water: {
                          ...p.water,
                          times: [...p.water.times, addMinutes(p.water.times[p.water.times.length - 1], 120)],
                        },
                      }))
                    }
                    style={s.addBtn}
                  >
                    <Text style={s.addTxt}>+ agregar horario</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </View>

          <View style={s.card}>
            <Head
              title="Kegel de la noche"
              meta="Todos los días, 15 min"
              color={C.plum}
              on={prefs.kegel.on}
              onToggle={(v) => toggle('kegel', v)}
            />
            {prefs.kegel.on ? (
              <TimeRow
                value={prefs.kegel.at}
                onChange={(at) => setPrefs((p) => ({ ...p, kegel: { ...p.kegel, at } }))}
              />
            ) : null}
          </View>

          {supported ? (
            <Pressable onPress={test} style={s.testBtn}>
              <Text style={s.testTxt}>{tested ? 'Debería llegar en 5 segundos…' : 'Probar un aviso'}</Text>
            </Pressable>
          ) : null}

          <Text style={s.foot}>
            Los avisos los programa el celular: llegan sin internet y con la app cerrada.
            {Platform.OS === 'android'
              ? ' Si tenés el ahorro de batería agresivo, Android puede atrasarlos unos minutos.'
              : ''}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 4,
  },
  screenTitle: { fontFamily: F.title, fontSize: 24, color: C.ink, letterSpacing: -0.5 },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: R.md,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  closeTxt: { fontFamily: F.bodySemi, fontSize: 13, color: C.pine },

  banner: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  bannerTitle: { fontFamily: F.bodySemi, fontSize: 14, color: C.ink, marginBottom: 6 },
  bannerBody: { fontFamily: F.body, fontSize: 13, lineHeight: 20, color: C.muted },
  linkBtn: { marginTop: 10, alignSelf: 'flex-start' },
  linkTxt: { fontFamily: F.bodySemi, fontSize: 13, color: C.blue },

  card: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 14,
    marginBottom: 12,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bar: { width: 3, height: 26, borderRadius: 2 },
  cardTitle: { fontFamily: F.titleSemi, fontSize: 15, color: C.ink, letterSpacing: -0.2 },
  cardMeta: { fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 2 },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  stepBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: C.paper,
  },
  stepTxt: { fontFamily: F.mono, fontSize: 12, color: C.ink },
  time: { flex: 1, textAlign: 'center', fontFamily: F.monoBold, fontSize: 19, color: C.ink },
  removeBtn: { paddingHorizontal: 4 },
  removeTxt: { fontFamily: F.body, fontSize: 20, color: C.muted, lineHeight: 22 },

  chips: { flexDirection: 'row', gap: 6, marginTop: 12 },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: C.paper,
  },
  chipTxt: { fontFamily: F.bodySemi, fontSize: 13, color: C.muted },

  addBtn: { marginTop: 10, alignSelf: 'flex-start' },
  addTxt: { fontFamily: F.bodySemi, fontSize: 13, color: C.blue },

  hint: { fontFamily: F.body, fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 12 },

  testBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: R.md,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  testTxt: { fontFamily: F.bodySemi, fontSize: 13, color: C.pine },

  foot: { fontFamily: F.body, fontSize: 12, lineHeight: 19, color: C.muted, marginTop: 18 },
});
