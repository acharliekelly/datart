// /src/logic/styleUtils.ts

export function clamp(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function lerp(min: number, max: number, plex: number): number {
  return min + (max - min) * plex;
}