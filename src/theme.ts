export const C = {
  paper: '#EEF1EC',
  card: '#FBFCFA',
  ink: '#22282A',
  muted: '#7C8688',
  pine: '#2F6D5F',
  terracotta: '#C1743E',
  blue: '#3E7591',
  plum: '#7A5578',
  hairline: '#DDE2DC',
  ground: '#C4CBC3',
  night: '#1c2422',
} as const;

/** Color de acento por tipo de bloque. */
export const BLOCK_COLOR = {
  warmup: C.muted,
  strength: C.pine,
  abs: C.terracotta,
  walk: C.terracotta,
  breath: C.blue,
  kegel: C.plum,
  review: C.muted,
} as const;

export type BlockKind = keyof typeof BLOCK_COLOR;

export const F = {
  title: 'Bricolage_700Bold',
  titleSemi: 'Bricolage_600SemiBold',
  body: 'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  mono: 'Mono_500Medium',
  monoBold: 'Mono_700Bold',
} as const;

export const R = { sm: 10, md: 12, lg: 14, xl: 20 } as const;
