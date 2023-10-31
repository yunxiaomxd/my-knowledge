export const clamp = (min: number, max: number, x: number) => {
  return Math.min(Math.max(min, x), max);
}