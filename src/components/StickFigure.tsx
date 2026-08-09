import React, { useEffect, useMemo } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { GROUND_Y, type Anim, type Pt } from '../data/anims';
import { C } from '../theme';

const NOMINAL_W = 220;

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);

/**
 * Caja que ocupa realmente la figura, uniendo las dos poses. Sin esto la figura
 * queda perdida en el medio del lienzo de 220×150 y en miniatura no se lee.
 */
function boundingBox(anim: Anim, strokeWidth: number, withGround: boolean) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const eat = (x: number, y: number, pad: number) => {
    minX = Math.min(minX, x - pad);
    minY = Math.min(minY, y - pad);
    maxX = Math.max(maxX, x + pad);
    maxY = Math.max(maxY, y + pad);
  };

  for (const pose of [anim.a, anim.b]) {
    for (const limb of pose.limbs) for (const [x, y] of limb) eat(x, y, strokeWidth / 2);
    eat(pose.head[0], pose.head[1], anim.headR);
    if (pose.aura) eat(pose.aura.c[0], pose.aura.c[1], pose.aura.r);
  }
  if (withGround) maxY = Math.max(maxY, GROUND_Y + 2);

  const pad = 4;
  return {
    x: minX - pad,
    y: minY - pad,
    w: maxX - minX + pad * 2,
    h: maxY - minY + pad * 2,
  };
}

/** Construye el atributo `d` de una polilínea. Corre en el hilo de UI. */
function pathOf(a: Pt[], b: Pt[], t: number) {
  'worklet';
  let d = '';
  for (let i = 0; i < a.length; i++) {
    const x = a[i][0] + (b[i][0] - a[i][0]) * t;
    const y = a[i][1] + (b[i][1] - a[i][1]) * t;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
  }
  return d;
}

function Limb({
  a,
  b,
  t,
  color,
  width,
}: {
  a: Pt[];
  b: Pt[];
  t: SharedValue<number>;
  color: string;
  width: number;
}) {
  const props = useAnimatedProps(() => ({ d: pathOf(a, b, t.value) }));
  return (
    <APath
      animatedProps={props}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Head({ a, b, r, t, color }: { a: Pt; b: Pt; r: number; t: SharedValue<number>; color: string }) {
  const props = useAnimatedProps(() => ({
    cx: a[0] + (b[0] - a[0]) * t.value,
    cy: a[1] + (b[1] - a[1]) * t.value,
  }));
  return <ACircle animatedProps={props} r={r} fill={color} />;
}

function Aura({
  a,
  b,
  t,
  color,
}: {
  a: NonNullable<Anim['a']['aura']>;
  b: NonNullable<Anim['a']['aura']>;
  t: SharedValue<number>;
  color: string;
}) {
  const props = useAnimatedProps(() => ({
    cx: a.c[0] + (b.c[0] - a.c[0]) * t.value,
    cy: a.c[1] + (b.c[1] - a.c[1]) * t.value,
    r: a.r + (b.r - a.r) * t.value,
  }));
  return <ACircle animatedProps={props} fill={color} opacity={0.14} />;
}

type Props = {
  anim: Anim;
  /** Ancho de referencia en px. */
  size?: number;
  /**
   * 'canvas': todas las figuras comparten escala, así una flexión se ve chata y
   * una sentadilla alta, como en la vida real. 'box': la figura llena el hueco
   * (para miniaturas, donde lo que importa es que se lea).
   */
  fit?: 'canvas' | 'box';
  /** Sólo en fit='box': techo de alto. */
  maxHeight?: number;
  /** Grosor aparente en píxeles de pantalla; pisa strokeWidth. */
  strokePx?: number;
  color?: string;
  strokeWidth?: number;
  /** En false dibuja sólo la pose inicial (para listas). */
  animate?: boolean;
  showGround?: boolean;
};

export default function StickFigure({
  anim,
  size = 180,
  fit = 'canvas',
  maxHeight,
  strokePx,
  color = C.pine,
  strokeWidth = 8,
  animate = true,
  showGround = true,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!animate) {
      t.value = 0;
      return;
    }
    t.value = 0;
    t.value = withRepeat(
      withTiming(1, { duration: anim.dur, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(t);
  }, [anim, animate, t]);

  const box = useMemo(() => boundingBox(anim, strokeWidth, showGround), [anim, strokeWidth, showGround]);
  const vb = `${box.x} ${box.y} ${box.w} ${box.h}`;

  let w: number;
  let h: number;
  if (fit === 'canvas') {
    // Escala común: `size` es el ancho del lienzo nominal, no el de esta figura.
    const k = size / NOMINAL_W;
    w = box.w * k;
    h = box.h * k;
  } else {
    w = size;
    h = (size * box.h) / box.w;
    if (maxHeight && h > maxHeight) {
      h = maxHeight;
      w = (maxHeight * box.w) / box.h;
    }
  }

  // El grosor está en unidades del viewBox: para que se vea igual en pantalla
  // hay que dividirlo por la escala a la que quedó esta figura.
  const sw = strokePx ? (strokePx * box.w) / w : strokeWidth;

  const ground = showGround ? (
    <Line
      x1={box.x + 3}
      y1={GROUND_Y}
      x2={box.x + box.w - 3}
      y2={GROUND_Y}
      stroke={C.ground}
      strokeWidth={2.5}
      strokeDasharray="2 6"
      strokeLinecap="round"
    />
  ) : null;

  // Sin animación no hace falta pasar por el hilo de UI: dibujamos la pose a y listo.
  if (!animate) {
    return (
      <Svg width={w} height={h} viewBox={vb}>
        {ground}
        {anim.a.aura ? (
          <Circle cx={anim.a.aura.c[0]} cy={anim.a.aura.c[1]} r={anim.a.aura.r} fill={color} opacity={0.14} />
        ) : null}
        {anim.a.limbs.map((limb, i) => (
          <Path
            key={i}
            d={pathOf(limb, limb, 0)}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <Circle cx={anim.a.head[0]} cy={anim.a.head[1]} r={anim.headR} fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={w} height={h} viewBox={vb}>
      {ground}
      {anim.a.aura && anim.b.aura ? (
        <Aura a={anim.a.aura} b={anim.b.aura} t={t} color={color} />
      ) : null}
      {anim.a.limbs.map((limb, i) => (
        <Limb key={i} a={limb} b={anim.b.limbs[i] ?? limb} t={t} color={color} width={sw} />
      ))}
      <Head a={anim.a.head} b={anim.b.head} r={anim.headR} t={t} color={color} />
    </Svg>
  );
}
