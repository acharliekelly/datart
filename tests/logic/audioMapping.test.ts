import { describe, expect, it } from "vitest";
import { buildGenerationState } from "../../src/logic/generation";
import { buildAudioState } from "../../src/logic/audioMapping";
import type { GenerationOptions, UserTraits } from "../../src/logic/types";

const traits: UserTraits = {
  timeZone: "America/New_York",
  userAgent: "Mozilla/5.0 Firefox/121.0",
  language: "en-US",
  screenWidth: 1440,
  screenHeight: 900,
  devicePixelRatio: 2,
  darkMode: true,
  ipInfo: {
    ip: "198.51.100.88",
    city: "Example City",
    region: "Example Region",
    country: "Example Country",
    continentCode: "NA",
  },
};

const options: GenerationOptions = {
  mode: "manual",
  manualSeed: 42,
  manualStyle: "tree",
  complexity: 60,
  paletteShift: 0,
};

describe("buildAudioState", () => {
  it("is deterministic for the same generation state", () => {
    const generation = buildGenerationState(traits, options);

    expect(buildAudioState(generation)).toEqual(buildAudioState(generation));
  });

  it("maps complexity to denser and faster sound", () => {
    const low = buildAudioState(
      buildGenerationState(traits, { ...options, complexity: 10 })
    );
    const high = buildAudioState(
      buildGenerationState(traits, { ...options, complexity: 95 })
    );

    expect(high.tempo).toBeGreaterThan(low.tempo);
    expect(high.notes.length).toBeGreaterThan(low.notes.length);
  });

  it("keeps generated sound parameters in conservative ranges", () => {
    const audio = buildAudioState(buildGenerationState(traits, options));

    expect(audio.masterGain).toBeGreaterThanOrEqual(0.03);
    expect(audio.masterGain).toBeLessThanOrEqual(0.18);
    expect(audio.filterFrequency).toBeGreaterThanOrEqual(400);
    expect(audio.notes.length).toBeGreaterThanOrEqual(3);
    expect(audio.notes.length).toBeLessThanOrEqual(14);
    expect(audio.rhythm.length).toBeGreaterThan(0);
    expect(audio.chordFrequencies.length).toBeGreaterThan(0);
    for (const note of audio.notes) {
      expect(note.frequency).toBeGreaterThan(50);
      expect(note.frequency).toBeLessThan(2000);
      expect(note.pan).toBeGreaterThanOrEqual(-0.8);
      expect(note.pan).toBeLessThanOrEqual(0.8);
    }
  });

  it("gives visual styles distinct audio modes and profiles", () => {
    const styleIds = [
      "orbits",
      "strata",
      "constellation",
      "bubbles",
      "waves",
      "isogrid",
      "tree",
      "flowfield",
    ] as const;

    const states = styleIds.map((manualStyle) =>
      buildAudioState(
        buildGenerationState(traits, {
          ...options,
          manualStyle,
        })
      )
    );

    const modes = new Set(states.map((state) => state.mode));
    const waveforms = new Set(states.map((state) => state.waveform));
    const summaries = new Set(states.map((state) => state.summary));

    expect(modes.size).toBeGreaterThanOrEqual(6);
    expect(waveforms.size).toBeGreaterThanOrEqual(3);
    expect(summaries.size).toBe(styleIds.length);
  });
});
