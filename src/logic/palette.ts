// /src/logic/palette.ts


export function generatePalette(rng: () => number): string[] {
  const baseHue = Math.floor(rng() * 360);
  const palette: string[] = [];

  for (let i = 0; i < 5; i++) {
    const hue = (baseHue + i * 40) % 360;
    const sat = 40 + rng() * 40; // 40–80
    const light = 30 + rng() * 50; // 30–80
    palette.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }

  return palette;
}