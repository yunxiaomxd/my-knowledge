const lerp = (t: number, p1: number, p2: number): number => (1 - t) * p1 + t * p2;

const reduce = (t: number, ...ps: number[]): number[] => {
  const [p1, p2, ...rest] = ps;
  if (rest && rest.length > 0) {
    return [lerp(t, p1, p2), ...reduce(t, p2, ...rest)];
  }
  return [lerp(t, p1, p2)];
}

const deCasteljau = (t: number, ps: number[]): number => ps.length > 1
    ? deCasteljau(t, reduce(t, ...ps))
    : ps[0];

export default function bezierCurve() {
  const total = 48;
  const z = -1000;
  const p0 = [-70, -50, z];
  const p1 = [-30, 50, z];
  const p2 = [30, 50, z];
  const p3 = [70, -50, z];

  const positions: number[] = [];
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const x = deCasteljau(t, [p0[0], p1[0], p2[0], p3[0]]);
    const y = deCasteljau(t, [p0[1], p1[1], p2[1], p3[1]]);
    const z = deCasteljau(t, [p0[2], p1[2], p2[2], p3[2]]);
    positions.push(x, y, z);
  }

  return {
    positions,
    indices: [],
    normals: [],
    primitiveType: 'LINE_STRIP',
  }
}