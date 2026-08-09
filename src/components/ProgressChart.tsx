import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { C, F } from '../theme';

export type Point = { date: string; value: number; label: string };

/** Progresión por sesión. Con menos de 2 sesiones no dibuja línea, sólo el aviso. */
export default function ProgressChart({
  points,
  width,
  unit,
  color = C.pine,
}: {
  points: Point[];
  width: number;
  unit: string;
  color?: string;
}) {
  const H = 110;
  const padX = 10;
  const padTop = 14;
  const padBottom = 22;

  if (points.length < 2) {
    return (
      <View style={{ height: H, justifyContent: 'center' }}>
        <Text style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 19 }}>
          Anotá al menos dos sesiones y acá vas a ver si estás progresando.
        </Text>
      </View>
    );
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  // Si todo es igual, centramos la línea en vez de dividir por cero.
  const span = max - min || 1;
  const flat = max === min;

  const innerW = width - padX * 2;
  const innerH = H - padTop - padBottom;

  const x = (i: number) => padX + (innerW * i) / (points.length - 1);
  const y = (v: number) => (flat ? padTop + innerH / 2 : padTop + innerH - ((v - min) / span) * innerH);

  const poly = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  const last = points[points.length - 1];
  const first = points[0];

  return (
    <View>
      <Svg width={width} height={H}>
        <Line x1={padX} y1={padTop + innerH} x2={width - padX} y2={padTop + innerH} stroke={C.hairline} strokeWidth={1} />
        <Polyline points={poly} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={p.date + i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4.5 : 3} fill={color} />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -16 }}>
        <Text style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>
          {first.label} · {first.value}
          {unit}
        </Text>
        <Text style={{ fontFamily: F.mono, fontSize: 11, color }}>
          {last.label} · {last.value}
          {unit}
        </Text>
      </View>
    </View>
  );
}
