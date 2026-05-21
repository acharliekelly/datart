import type { GenerationState, StyleId } from "./types";
import { makeRng } from "./rng";

export type OscillatorVoice = OscillatorType;
export type AudioMode =
  | "pulse"
  | "drone"
  | "sparkle"
  | "pluck"
  | "wave"
  | "grid"
  | "bloom"
  | "branch"
  | "flow";
export type AtmosphereKind =
  | "orbital"
  | "sediment"
  | "starfield"
  | "buoyant"
  | "tide"
  | "geometric"
  | "shimmer"
  | "mist"
  | "curtain"
  | "branching"
  | "current";

export interface AudioNote {
  frequency: number;
  glideToFrequency: number | null;
  duration: number;
  velocity: number;
  pan: number;
  accent: boolean;
}

export interface AudioAtmosphere {
  kind: AtmosphereKind;
  frequencies: number[];
  gain: number;
  waveform: OscillatorVoice;
  filterFrequency: number;
  filterQ: number;
  detuneCents: number;
  modulationRate: number;
  modulationDepth: number;
  noiseMix: number;
}

export interface AudioState {
  styleId: StyleId;
  mode: AudioMode;
  tempo: number;
  masterGain: number;
  filterFrequency: number;
  filterQ: number;
  waveform: OscillatorVoice;
  attack: number;
  release: number;
  echoMix: number;
  echoTime: number;
  rhythm: number[];
  chordFrequencies: number[];
  atmosphere: AudioAtmosphere;
  notes: AudioNote[];
  summary: string;
}

interface HslColor {
  hue: number;
  saturation: number;
  lightness: number;
}

interface StyleAudioProfile {
  mode: AudioMode;
  atmosphereKind: AtmosphereKind;
  waveform: OscillatorVoice;
  scale: number[];
  tempoBase: number;
  tempoRange: number;
  noteBase: number;
  noteRange: number;
  durationBase: number;
  durationRange: number;
  attack: number;
  release: number;
  filterBase: number;
  filterRange: number;
  filterQ: number;
  echoMix: number;
  echoTime: number;
  rootOffset: number;
  octaveChance: number;
  rhythm: number[];
  chord: number[];
  atmosphereGain: number;
  atmosphereNoise: number;
  glideChance: number;
}

const MAJOR_PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16];
const MINOR_PENTATONIC = [0, 3, 5, 7, 10, 12, 15, 17];
const LYDIAN = [0, 2, 4, 6, 7, 9, 11, 12];
const WHOLE_TONE = [0, 2, 4, 6, 8, 10, 12, 14];
const HARMONIC_MINOR = [0, 2, 3, 7, 8, 11, 12, 15];
const OCTATONIC = [0, 2, 3, 5, 6, 8, 9, 11, 12];

const DEFAULT_PROFILE: StyleAudioProfile = {
  mode: "pulse",
  atmosphereKind: "orbital",
  waveform: "sine",
  scale: MAJOR_PENTATONIC,
  tempoBase: 64,
  tempoRange: 52,
  noteBase: 4,
  noteRange: 6,
  durationBase: 0.2,
  durationRange: 0.34,
  attack: 0.025,
  release: 0.14,
  filterBase: 700,
  filterRange: 2600,
  filterQ: 0.8,
  echoMix: 0.18,
  echoTime: 0.28,
  rootOffset: 0,
  octaveChance: 0.22,
  rhythm: [1, 1, 1.5, 0.5],
  chord: [0, 7, 12],
  atmosphereGain: 0.22,
  atmosphereNoise: 0.03,
  glideChance: 0.08,
};

const STYLE_PROFILES: Partial<Record<StyleId, StyleAudioProfile>> = {
  orbits: {
    ...DEFAULT_PROFILE,
    mode: "pulse",
    atmosphereKind: "orbital",
    waveform: "sine",
    scale: MAJOR_PENTATONIC,
    tempoBase: 48,
    tempoRange: 38,
    durationBase: 0.32,
    durationRange: 0.46,
    attack: 0.04,
    release: 0.22,
    echoMix: 0.28,
    echoTime: 0.42,
    rhythm: [1.5, 1, 1.5, 2],
    chord: [0, 7, 12],
    atmosphereGain: 0.3,
  },
  strata: {
    ...DEFAULT_PROFILE,
    mode: "drone",
    atmosphereKind: "sediment",
    waveform: "triangle",
    scale: HARMONIC_MINOR,
    tempoBase: 36,
    tempoRange: 28,
    noteBase: 3,
    noteRange: 4,
    durationBase: 0.8,
    durationRange: 1.2,
    attack: 0.18,
    release: 0.55,
    filterBase: 420,
    filterRange: 1200,
    echoMix: 0.34,
    echoTime: 0.65,
    rootOffset: -7,
    rhythm: [2, 3, 1.5],
    chord: [0, 3, 10],
    atmosphereGain: 0.42,
    atmosphereNoise: 0.08,
  },
  constellation: {
    ...DEFAULT_PROFILE,
    mode: "sparkle",
    atmosphereKind: "starfield",
    waveform: "sine",
    scale: LYDIAN,
    tempoBase: 78,
    tempoRange: 78,
    noteBase: 6,
    noteRange: 8,
    durationBase: 0.08,
    durationRange: 0.18,
    attack: 0.006,
    release: 0.18,
    filterBase: 1800,
    filterRange: 3600,
    filterQ: 1.2,
    echoMix: 0.42,
    echoTime: 0.18,
    rootOffset: 12,
    octaveChance: 0.48,
    rhythm: [0.5, 0.5, 1, 0.25, 0.75],
    chord: [0, 4, 11],
    atmosphereGain: 0.18,
    atmosphereNoise: 0.05,
    glideChance: 0.35,
  },
  bubbles: {
    ...DEFAULT_PROFILE,
    mode: "pluck",
    atmosphereKind: "buoyant",
    waveform: "sine",
    scale: MAJOR_PENTATONIC,
    tempoBase: 68,
    tempoRange: 58,
    durationBase: 0.1,
    durationRange: 0.22,
    attack: 0.008,
    release: 0.12,
    filterBase: 1100,
    filterRange: 2300,
    echoMix: 0.25,
    echoTime: 0.22,
    rootOffset: 5,
    octaveChance: 0.36,
    rhythm: [0.75, 0.5, 1.25, 0.5],
    chord: [0, 7, 14],
    atmosphereGain: 0.18,
    glideChance: 0.18,
  },
  waves: {
    ...DEFAULT_PROFILE,
    mode: "wave",
    atmosphereKind: "tide",
    waveform: "triangle",
    scale: MINOR_PENTATONIC,
    tempoBase: 52,
    tempoRange: 44,
    durationBase: 0.42,
    durationRange: 0.65,
    attack: 0.09,
    release: 0.36,
    filterBase: 650,
    filterRange: 1900,
    echoMix: 0.36,
    echoTime: 0.5,
    rhythm: [1, 2, 0.75, 1.25],
    chord: [0, 5, 12],
    atmosphereGain: 0.36,
    atmosphereNoise: 0.12,
    glideChance: 0.28,
  },
  supershape: {
    ...DEFAULT_PROFILE,
    mode: "bloom",
    atmosphereKind: "shimmer",
    waveform: "sawtooth",
    scale: WHOLE_TONE,
    tempoBase: 70,
    tempoRange: 64,
    filterQ: 1.4,
    rootOffset: 7,
    rhythm: [1, 0.5, 0.5, 1.5],
    chord: [0, 4, 8],
    atmosphereGain: 0.28,
  },
  isogrid: {
    ...DEFAULT_PROFILE,
    mode: "grid",
    atmosphereKind: "geometric",
    waveform: "square",
    scale: OCTATONIC,
    tempoBase: 88,
    tempoRange: 70,
    durationBase: 0.06,
    durationRange: 0.14,
    attack: 0.004,
    release: 0.08,
    filterBase: 900,
    filterRange: 2600,
    filterQ: 1.6,
    echoMix: 0.16,
    echoTime: 0.16,
    rhythm: [0.5, 0.5, 0.5, 1],
    chord: [0, 6, 9],
    atmosphereGain: 0.12,
  },
  crystal: {
    ...DEFAULT_PROFILE,
    mode: "sparkle",
    atmosphereKind: "shimmer",
    waveform: "triangle",
    scale: LYDIAN,
    tempoBase: 72,
    tempoRange: 84,
    durationBase: 0.09,
    durationRange: 0.2,
    attack: 0.005,
    release: 0.22,
    filterBase: 1600,
    filterRange: 3300,
    filterQ: 1.8,
    echoMix: 0.46,
    echoTime: 0.24,
    rootOffset: 10,
    octaveChance: 0.5,
    rhythm: [0.5, 1, 0.5, 0.25, 0.75],
    chord: [0, 6, 12],
    atmosphereGain: 0.2,
  },
  lattice: {
    ...DEFAULT_PROFILE,
    mode: "grid",
    atmosphereKind: "geometric",
    waveform: "square",
    scale: OCTATONIC,
    tempoBase: 76,
    tempoRange: 68,
    filterQ: 1.5,
    rhythm: [0.75, 0.75, 1, 0.5],
    chord: [0, 3, 9],
    atmosphereGain: 0.16,
  },
  nebula: {
    ...DEFAULT_PROFILE,
    mode: "drone",
    atmosphereKind: "mist",
    waveform: "sine",
    scale: LYDIAN,
    tempoBase: 34,
    tempoRange: 24,
    durationBase: 1.0,
    durationRange: 1.4,
    attack: 0.22,
    release: 0.8,
    filterBase: 500,
    filterRange: 1500,
    echoMix: 0.48,
    echoTime: 0.72,
    rootOffset: -12,
    rhythm: [3, 2, 4],
    chord: [0, 7, 11],
    atmosphereGain: 0.46,
    atmosphereNoise: 0.16,
  },
  aurora: {
    ...DEFAULT_PROFILE,
    mode: "flow",
    atmosphereKind: "curtain",
    waveform: "sine",
    scale: LYDIAN,
    tempoBase: 46,
    tempoRange: 50,
    durationBase: 0.56,
    durationRange: 0.9,
    attack: 0.14,
    release: 0.58,
    filterBase: 900,
    filterRange: 2500,
    echoMix: 0.44,
    echoTime: 0.55,
    rootOffset: 3,
    rhythm: [1.5, 0.75, 1.25, 2],
    chord: [0, 6, 11],
    atmosphereGain: 0.42,
    atmosphereNoise: 0.1,
    glideChance: 0.42,
  },
  voronoi: {
    ...DEFAULT_PROFILE,
    mode: "bloom",
    atmosphereKind: "mist",
    waveform: "sawtooth",
    scale: WHOLE_TONE,
    tempoBase: 58,
    tempoRange: 56,
    durationBase: 0.22,
    durationRange: 0.6,
    attack: 0.045,
    release: 0.3,
    filterQ: 1.2,
    echoMix: 0.34,
    rhythm: [1, 0.5, 1.5, 0.5],
    chord: [0, 4, 8],
    atmosphereGain: 0.28,
    atmosphereNoise: 0.1,
  },
  fern: {
    ...DEFAULT_PROFILE,
    mode: "branch",
    atmosphereKind: "branching",
    waveform: "triangle",
    scale: MINOR_PENTATONIC,
    tempoBase: 60,
    tempoRange: 58,
    durationBase: 0.16,
    durationRange: 0.38,
    attack: 0.018,
    release: 0.2,
    echoMix: 0.28,
    echoTime: 0.31,
    rootOffset: -5,
    rhythm: [0.75, 0.75, 0.5, 1.25],
    chord: [0, 7, 15],
    atmosphereGain: 0.2,
  },
  koch: {
    ...DEFAULT_PROFILE,
    mode: "sparkle",
    atmosphereKind: "shimmer",
    waveform: "triangle",
    scale: OCTATONIC,
    tempoBase: 66,
    tempoRange: 70,
    filterQ: 1.7,
    rootOffset: 8,
    rhythm: [1, 0.5, 0.5, 0.5],
    chord: [0, 6, 12],
    atmosphereGain: 0.22,
  },
  tree: {
    ...DEFAULT_PROFILE,
    mode: "branch",
    atmosphereKind: "branching",
    waveform: "triangle",
    scale: HARMONIC_MINOR,
    tempoBase: 50,
    tempoRange: 54,
    durationBase: 0.2,
    durationRange: 0.48,
    attack: 0.035,
    release: 0.28,
    rootOffset: -10,
    rhythm: [1, 0.5, 0.75, 1.5],
    chord: [0, 7, 12],
    atmosphereGain: 0.28,
  },
  flowfield: {
    ...DEFAULT_PROFILE,
    mode: "flow",
    atmosphereKind: "current",
    waveform: "sine",
    scale: LYDIAN,
    tempoBase: 54,
    tempoRange: 48,
    durationBase: 0.36,
    durationRange: 0.72,
    attack: 0.08,
    release: 0.38,
    filterBase: 800,
    filterRange: 2600,
    echoMix: 0.38,
    echoTime: 0.4,
    rhythm: [0.75, 1.25, 0.75, 1.75],
    chord: [0, 6, 9],
    atmosphereGain: 0.34,
    atmosphereNoise: 0.12,
    glideChance: 0.38,
  },
};

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

export function buildAudioState(state: GenerationState): AudioState {
  const rng = makeRng(state.seed + 13_371);
  const paletteAverage = averagePalette(state.palette);
  const complexity = clamp(0, 1, state.complexity / 100);
  const profile = STYLE_PROFILES[state.styleId] ?? DEFAULT_PROFILE;
  const scale = profile.scale;

  const baseMidi =
    45 + Math.round((paletteAverage.hue / 360) * 18) + profile.rootOffset;
  const rootFrequency = frequencyFromSemitone(440, baseMidi - 69);
  const tempo = Math.round(
    profile.tempoBase + complexity * profile.tempoRange + rng() * 8
  );
  const noteCount = Math.round(profile.noteBase + complexity * profile.noteRange);
  const filterFrequency = Math.round(
    profile.filterBase +
      (paletteAverage.lightness / 100) * profile.filterRange +
      complexity * profile.filterRange * 0.45
  );
  const masterGain = clamp(
    0.03,
    0.18,
    0.055 + (paletteAverage.saturation / 100) * 0.065 + complexity * 0.05
  );
  const chordFrequencies = profile.chord.map((degree) =>
    frequencyFromSemitone(rootFrequency, degree)
  );
  const atmosphereFrequencies = profile.chord.map((degree) =>
    frequencyFromSemitone(rootFrequency / 2, degree)
  );
  const atmosphere: AudioAtmosphere = {
    kind: profile.atmosphereKind,
    frequencies: atmosphereFrequencies,
    gain: clamp(0.02, 0.12, masterGain * profile.atmosphereGain),
    waveform: profile.mode === "grid" ? "triangle" : profile.waveform,
    filterFrequency: Math.round(filterFrequency * 0.75),
    filterQ: Math.max(0.45, profile.filterQ * 0.7),
    detuneCents: 4 + Math.round(complexity * 18 + rng() * 8),
    modulationRate: 0.025 + rng() * 0.06 + complexity * 0.05,
    modulationDepth: 0.08 + complexity * 0.16,
    noiseMix: profile.atmosphereNoise,
  };

  const notes: AudioNote[] = [];
  for (let i = 0; i < noteCount; i++) {
    const degree = scale[Math.floor(rng() * scale.length)] ?? 0;
    const nextDegree = scale[Math.floor(rng() * scale.length)] ?? degree;
    const octave = rng() < profile.octaveChance ? 12 : 0;
    const frequency = frequencyFromSemitone(rootFrequency, degree + octave);
    const shouldGlide = rng() < profile.glideChance;
    const duration =
      profile.durationBase + rng() * (profile.durationRange + complexity * 0.24);
    const velocity = 0.45 + rng() * (0.35 + complexity * 0.15);
    const pan = clamp(-0.8, 0.8, (rng() - 0.5) * (0.6 + complexity));
    const accent = i % Math.max(2, Math.round(5 - complexity * 3)) === 0;

    notes.push({
      frequency,
      glideToFrequency: shouldGlide
        ? frequencyFromSemitone(rootFrequency, nextDegree + octave)
        : null,
      duration,
      velocity,
      pan,
      accent,
    });
  }

  return {
    styleId: state.styleId,
    mode: profile.mode,
    tempo,
    masterGain,
    filterFrequency,
    filterQ: profile.filterQ,
    waveform: profile.waveform,
    attack: profile.attack,
    release: profile.release,
    echoMix: profile.echoMix,
    echoTime: profile.echoTime,
    rhythm: profile.rhythm,
    chordFrequencies,
    atmosphere,
    notes,
    summary:
      `${state.styleId} ${profile.mode}/${profile.atmosphereKind}: ${tempo} BPM, ${notes.length} notes, ` +
      `${Math.round(filterFrequency)} Hz brightness`,
  };
}
