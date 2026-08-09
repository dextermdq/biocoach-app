import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useStore, WATER_GOAL } from '../lib/store';
import { C, F, R } from '../theme';

function Glass({ full, color }: { full: boolean; color: string }) {
  return (
    <Svg width={22} height={28} viewBox="0 0 24 30">
      <Path
        d="M5.5 4 H18.5 L16.6 26.5 Q16.5 27.5 15.5 27.5 H8.5 Q7.5 27.5 7.4 26.5 Z"
        fill={full ? color : 'none'}
        stroke={full ? color : C.ground}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Vasos del día. Se toca un vaso y el total pasa a ser ese; tocando el último
 * lleno se resta uno, que es como se corrige un toque de más.
 */
export default function WaterTracker({ date }: { date: string }) {
  const { water, setWater } = useStore();
  const count = water[date] ?? 0;

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={[s.bar, { backgroundColor: C.blue }]} />
        <Text style={s.title}>Agua</Text>
        <Text style={[s.count, count >= WATER_GOAL && { color: C.blue }]}>
          {count}/{WATER_GOAL}
        </Text>
      </View>

      <View style={s.card}>
        <View style={s.glasses}>
          {Array.from({ length: WATER_GOAL }, (_, i) => {
            const n = i + 1;
            const full = n <= count;
            return (
              <Pressable
                key={n}
                onPress={() => setWater(date, count === n ? n - 1 : n)}
                hitSlop={6}
                style={s.glassBtn}
              >
                <Glass full={full} color={C.blue} />
              </Pressable>
            );
          })}
        </View>

        <Text style={s.hint}>
          {count >= WATER_GOAL
            ? 'Meta del día cumplida.'
            : 'Tocá el vaso al que llegaste. Para restar, tocá el último lleno.'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 26 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  bar: { width: 3, height: 14, borderRadius: 2 },
  title: { flex: 1, fontFamily: F.titleSemi, fontSize: 15, color: C.ink, letterSpacing: -0.2 },
  count: { fontFamily: F.monoBold, fontSize: 13, color: C.muted },
  card: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.hairline,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  glasses: { flexDirection: 'row', justifyContent: 'space-between' },
  glassBtn: { paddingHorizontal: 2, paddingVertical: 2 },
  hint: { fontFamily: F.body, fontSize: 12, color: C.muted, marginTop: 10, paddingHorizontal: 2 },
});
