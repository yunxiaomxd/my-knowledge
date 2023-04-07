const lerp = (t: number, p1: number, p2: number): number => (1 - t) * p1 + t * p2;

const reduce = (t: number, ...ps: number[]): number[] => {
  const [p1, p2, ...rest] = ps;
  if (rest && rest.length > 0) {
    return [lerp(t, p1, p2), ...reduce(t, p2, ...rest)];
  }
  return [lerp(t, p1, p2)];
}

// Example: deCasteljau(0.5, [0.0, 1.0, 2.0, 3.0]) == 1.5
const deCasteljau = (t: number, ps: number[]): number => ps.length > 1
    ? deCasteljau(t, reduce(t, ...ps))
    : ps[0];

export default function bezierCurve() {
  const t = 
}