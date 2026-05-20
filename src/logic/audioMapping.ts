import type { GenerationState, StyleId } from "./types";
import { makeRng } from "./rng";

export type OscillatorVoice = OscillatorType;

export interface AudioNote {
  frequency: number;
  duration: number;
  velocity: number;
  pan: number;
}

export interface AudioState {
  styleId: StyleId;
  tempo: number;
  masterGain: number;
  filterFrequency: number;
  waveform: OscillatorVoice;
  notes: AudioNote[];
  summary: string;
}

interface HslColor {
  hue: number;
  saturation: number;
  lightness: number;
}

const STYLE_WAVEFORMS: Partial<Record<StyleId, OscillatorVoice>> = {
  orbits: "sine",
  strata: "triangle",
  constellation: "sine",
  bubbles: "sine",
  waves: "triangle",
  supershape: "sawtooth",
  isogrid: "square",
  crystal: "triangle",
  lattice: "square",
  nebula: "sine",
  aurora: "sine",
  voronoi: "sawtooth",
  fern: "triangle",
  koch: "triangle",
  tree: "triangle",
  flowfield: "sine",
};

const MAJOR_PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16];
const MINOR_PENTATONIC = [0, 3, 5, 7, 10, 12, 15, 17];
const LYDIAN = [0, 2, 4, 6, 7, 9, 11, 12];

function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseHslColor(color: string): HslColor | null {
  const match = color.match(
    /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i
  );
  if (!match) return null;

  return {
    hue: Number(match[1]),
    saturation: Number(match[2]),
    lightness: Number(match[3]),
  };
}

function averagePalette(palette: string[]): HslColor {
  const parsed = palette
    .map(parseHslColor)
    .filter((color): color is HslColor => color !== null);

  if (!parsed.length) {
    return { hue: 180, saturation: 55, lightness: 50 };
  }

  const totals = parsed.reduce(
    (sum, color) => ({
      hue: sum.hue + color.hue,
      saturation: sum.saturation + color.saturation,
      lightness: sum.lightness + color.lightness,
    }),
    { hue: 0, saturation: 0, lightness: 0 }
  );

  return {
    hue: totals.hue / parsed.length,
    saturation: totals.saturation / parsed.length,
    lightness: totals.lightness / parsed.length,
  };
}

function frequencyFromSemitone(rootFrequency: number, semitone: number): number {
  return rootFrequency * Math.pow(2, semitone / 12);
}

function getScale(styleId: StyleId): number[] {
  if (styleId === "strata" || styleId === "tree" || styleId === "fern") {
    return MINOR_PENTATONIC;
  }
  if (styleId === "aurora" || styleId === "nebula" || styleId === "flowfield") {
    return LYDIAN;
  }
  return MAJOR_PENTATONIC;
}

export function buildAudioState(state: GenerationState): AudioState {
  const rng = makeRng(state.seed + 13_371);
  const paletteAverage = averagePalette(state.palette);
  const complexity = clamp(0, 1, state.complexity / 100);
  const scale = getScale(state.styleId);

  const baseMidi = 45 + Math.round((paletteAverage.hue / 360) * 18);
  const rootFrequency = frequencyFromSemitone(440, baseMidi - 69);
  const tempo = Math.round(48 + complexity * 72 + rng() * 10);
  const noteCount = Math.round(3 + complexity * 7);
  const filterFrequency = Math.round(
    600 + (paletteAverage.lightness / 100) * 2200 + complexity * 1200
  );
  const masterGain = clamp(
    0.03,
    0.16,
    0.06 + (paletteAverage.saturation / 100) * 0.06 + complexity * 0.04
  );

  const notes: AudioNote[] = [];
  for (let i = 0; i < noteCount; i++) {
    const degree = scale[Math.floor(rng() * scale.length)] ?? 0;
    const octave = rng() > 0.78 ? 12 : 0;
    const duration = 0.18 + rng() * (0.34 + complexity * 0.28);
    const velocity = 0.45 + rng() * (0.35 + complexity * 0.15);
    const pan = clamp(-0.8, 0.8, (rng() - 0.5) * (0.6 + complexity));

    notes.push({
      frequency: frequencyFromSemitone(rootFrequency, degree + octave),
      duration,
      velocity,
      pan,
    });
  }

  return {
    styleId: state.styleId,
    tempo,
    masterGain,
    filterFrequency,
    waveform: STYLE_WAVEFORMS[state.styleId] ?? "sine",
    notes,
    summary:
      `${state.styleId} sound: ${tempo} BPM, ${notes.length} notes, ` +
      `${Math.round(filterFrequency)} Hz brightness`,
  };
}
