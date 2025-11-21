// /src/logic/rng.ts

export function hashStringToInt(str: string, max = 1_000_000): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % max;
}

export function makeRng(seed: number): () => number {
  return function next() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}
