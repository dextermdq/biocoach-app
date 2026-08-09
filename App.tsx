// Importamos por peso, no el índice de la familia: el índice arrastra los ~10 pesos
// de cada tipografía al bundle.
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import ExerciseSheet, { type SheetTarget } from './src/components/ExerciseSheet';
import StickFigure from './src/components/StickFigure';
import WaterTracker from './src/components/WaterTracker';
import { ANIMS } from './src/data/anims';
import { NOTES } from './src/data/notes';
import { EXERCISES, WEEK, itemKey, type Block, type Day, type Item } from './src/data/program';
import { dateOfIsoDayThisWeek, isoDay, shortDate, ymd } from './src/lib/date';
import { StoreProvider, useStore } from './src/lib/store';
import { BLOCK_COLOR, C, F, R } from './src/theme';

function DayStrip({
  selected,
  today,
  onSelect,
}: {
  selected: string;
  today: number;
  onSelect: (d: Day) => void;
}) {
  return (
    <View style={s.strip}>
      {WEEK.map((d) => {
        const active = d.key === selected;
        const isToday = d.iso === today;
        return (
          <Pressable
            key={d.key}
            onPress={() => onSelect(d)}
            style={[s.dayTab, active && s.dayTabOn]}
            hitSlop={4}
          >
            <Text style={[s.dayTabTxt, active && s.dayTabTxtOn]}>{d.short}</Text>
            <View style={[s.dot, isToday && { backgroundColor: active ? '#fff' : C.pine }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

function ExerciseRow({
  day,
  block,
  item,
  date,
  onOpen,
}: {
  day: Day;
  block: Block;
  item: Item;
  date: string;
  onOpen: (t: SheetTarget) => void;
}) {
  const { isDone, toggle } = useStore();
  const ex = EXERCISES[item.ex];
  const key = itemKey(day, block, item);
  const done = isDone(date, key);
  const color = BLOCK_COLOR[block.kind];

  return (
    <Pressable
      style={s.row}
      onPress={() => onOpen({ exId: item.ex, sets: item.sets, key, color })}
    >
      <View style={s.thumb}>
        <StickFigure
          anim={ANIMS[ex.anim]}
          size={54}
          fit="box"
          maxHeight={46}
          strokePx={3.4}
          color={done ? C.ground : color}
          animate={false}
          showGround={false}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[s.rowName, done && s.rowNameDone]} numberOfLines={1}>
          {ex.name}
        </Text>
        {item.sets ? <Text style={s.rowSets}>{item.sets}</Text> : null}
      </View>

      <Pressable
        onPress={() => toggle(date, key)}
        hitSlop={14}
        style={[s.check, done && { backgroundColor: color, borderColor: color }]}
      >
        {done ? <Text style={s.checkMark}>✓</Text> : null}
      </Pressable>
    </Pressable>
  );
}

function BlockCard({
  day,
  block,
  date,
  onOpen,
}: {
  day: Day;
  block: Block;
  date: string;
  onOpen: (t: SheetTarget) => void;
}) {
  const color = BLOCK_COLOR[block.kind];
  return (
    <View style={s.block}>
      <View style={s.blockHead}>
        <View style={[s.blockBar, { backgroundColor: color }]} />
        <Text style={s.blockTitle}>{block.title}</Text>
        {block.meta ? <Text style={s.blockMeta}>{block.meta}</Text> : null}
      </View>
      <View style={s.card}>
        {block.items.map((item, i) => (
          <View key={`${block.id}-${item.ex}-${i}`}>
            {i > 0 ? <View style={s.sep} /> : null}
            <ExerciseRow day={day} block={block} item={item} date={date} onOpen={onOpen} />
          </View>
        ))}
      </View>
    </View>
  );
}

function Notes() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View style={{ marginTop: 30 }}>
      <Text style={s.notesTitle}>Método</Text>
      {NOTES.map((n, i) => {
        const isOpen = open === i;
        return (
          <Pressable key={n.title} onPress={() => setOpen(isOpen ? null : i)} style={s.note}>
            <View style={s.noteHead}>
              <View style={[s.noteDot, { backgroundColor: C[n.accent] }]} />
              <Text style={s.noteTitle}>{n.title}</Text>
              <Text style={s.noteChevron}>{isOpen ? '–' : '+'}</Text>
            </View>
            {isOpen ? <Text style={s.noteBody}>{n.body}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function Home() {
  const today = isoDay();
  const [dayKey, setDayKey] = useState(() => WEEK.find((d) => d.iso === today)?.key ?? 'mon');
  const [target, setTarget] = useState<SheetTarget | null>(null);
  const { checks } = useStore();

  const day = WEEK.find((d) => d.key === dayKey)!;
  const date = useMemo(() => ymd(dateOfIsoDayThisWeek(day.iso)), [day.iso]);
  const dateLabel = useMemo(() => shortDate(dateOfIsoDayThisWeek(day.iso)), [day.iso]);

  const total = day.blocks.reduce((n, b) => n + b.items.length, 0);
  const doneCount = day.blocks.reduce(
    (n, b) => n + b.items.filter((it) => checks[`${date}|${itemKey(day, b, it)}`]).length,
    0
  );
  const pct = total ? doneCount / total : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.paper }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        <View style={s.header}>
          <Text style={s.brand}>BIOCOACH</Text>
          <Text style={s.headerDate}>{dateLabel}</Text>
        </View>

        <DayStrip selected={dayKey} today={today} onSelect={(d) => setDayKey(d.key)} />

        <Text style={s.dayTitle}>{day.title}</Text>

        <View style={s.progressRow}>
          <View style={s.track}>
            <View style={[s.fill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
          <Text style={s.progressTxt}>
            {doneCount}/{total}
          </Text>
        </View>

        {day.blocks.map((b) => (
          <BlockCard key={b.id} day={day} block={b} date={date} onOpen={setTarget} />
        ))}

        <WaterTracker date={date} />

        <Notes />
      </ScrollView>

      <ExerciseSheet target={target} date={date} onClose={() => setTarget(null)} />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Gate() {
  const { ready } = useStore();
  if (!ready) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={C.pine} />
      </View>
    );
  }
  return <Home />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Bricolage_700Bold: BricolageGrotesque_700Bold,
    Bricolage_600SemiBold: BricolageGrotesque_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Mono_500Medium: JetBrainsMono_500Medium,
    Mono_700Bold: JetBrainsMono_700Bold,
  });

  // Si una tipografía no carga seguimos igual con la del sistema: quedarse en el
  // spinner para siempre es peor que verse un poco distinto.
  if (!fontsLoaded && !fontError) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={C.pine} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Gate />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  brand: { fontFamily: F.title, fontSize: 20, color: C.ink, letterSpacing: 1.5 },
  headerDate: { fontFamily: F.mono, fontSize: 12, color: C.muted },

  strip: { flexDirection: 'row', gap: 6, marginTop: 18 },
  dayTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: R.md,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  dayTabOn: { backgroundColor: C.ink, borderColor: C.ink },
  dayTabTxt: { fontFamily: F.bodySemi, fontSize: 14, color: C.muted },
  dayTabTxtOn: { color: '#fff' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 5, backgroundColor: 'transparent' },

  dayTitle: { fontFamily: F.title, fontSize: 26, color: C.ink, marginTop: 22, letterSpacing: -0.6 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  track: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.hairline, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3, backgroundColor: C.pine },
  progressTxt: { fontFamily: F.mono, fontSize: 12, color: C.muted },

  block: { marginTop: 26 },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  blockBar: { width: 3, height: 14, borderRadius: 2 },
  blockTitle: { fontFamily: F.titleSemi, fontSize: 15, color: C.ink, letterSpacing: -0.2 },
  blockMeta: { fontFamily: F.mono, fontSize: 11, color: C.muted },

  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.hairline },
  sep: { height: 1, backgroundColor: C.hairline, marginHorizontal: 12 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, gap: 10 },
  thumb: { width: 56, height: 48, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontFamily: F.bodySemi, fontSize: 15, color: C.ink },
  rowNameDone: { color: C.muted, textDecorationLine: 'line-through' },
  rowSets: { fontFamily: F.mono, fontSize: 12, color: C.muted, marginTop: 3 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.ground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 14, lineHeight: 16, fontFamily: F.bodySemi },

  notesTitle: { fontFamily: F.title, fontSize: 20, color: C.ink, marginBottom: 12, letterSpacing: -0.4 },
  note: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 14,
    marginBottom: 8,
  },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  noteDot: { width: 7, height: 7, borderRadius: 4 },
  noteTitle: { flex: 1, fontFamily: F.bodySemi, fontSize: 14, color: C.ink },
  noteChevron: { fontFamily: F.mono, fontSize: 16, color: C.muted },
  noteBody: { fontFamily: F.body, fontSize: 13.5, lineHeight: 21, color: C.muted, marginTop: 10 },
});
