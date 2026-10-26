export interface Pigment {
  fill: string;
  /** Legible label colour on top of `fill`. */
  ink: string;
}

const LIGHT = '#fbf8f1';
const DARK = '#16141a';

export const PALETTE: Pigment[] = [
  { fill: '#2f3bff', ink: LIGHT },
  { fill: '#ff5a36', ink: DARK },
  { fill: '#ffc21a', ink: DARK },
  { fill: '#00a86b', ink: LIGHT },
  { fill: '#ff6fb5', ink: DARK },
  { fill: '#7a3cff', ink: LIGHT },
  { fill: '#00b8d9', ink: DARK },
  { fill: '#ff8a1f', ink: DARK },
  { fill: '#8bc34a', ink: DARK },
  { fill: '#c2185b', ink: LIGHT },
  { fill: '#3d5a80', ink: LIGHT },
  { fill: '#a0522d', ink: LIGHT },
];

export function pigmentFor(colorIndex: number): Pigment {
  return PALETTE[colorIndex % PALETTE.length];
}
