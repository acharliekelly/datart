import { describe, expect, it } from "vitest";
import { buildAccessibilitySummary } from "../../src/logic/accessibilitySummary";
import { buildAudioState } from "../../src/logic/audioMapping";
import { buildGenerationState } from "../../src/logic/generation";
import type { GenerationOptions, UserTraits } from "../../src/logic/types";

const traits: UserTraits = {
  timeZone: "America/New_York",
  userAgent: "Mozilla/5.0 Firefox/121.0",
  language: "en-US",
  screenWidth: 1440,
  screenHeight: 900,
  devicePixelRatio: 2,
  darkMode: true,
};

const options: GenerationOptions = {
  mode: "manual",
  manualSeed: 42,
  manualStyle: "tree",
  complexity: 64,
  paletteShift: 0,
};

describe("buildAccessibilitySummary", () => {
  it("summarizes visual, motion, and sound state", () => {
    const generationState = buildGenerationState(traits, options);
    const audioState = buildAudioState(generationState);

    const summary = buildAccessibilitySummary({
      generationState,
      audioState,
      isAnimating: false,
      isAudioEnabled: true,
      audioVolume: 0.55,
      prefersReducedMotion: true,
    });

    expect(summary).toContain("Recursive Tree");
    expect(summary).toContain("Complexity 64");
    expect(summary).toContain("automatic complexity off");
    expect(summary).toContain("reduced motion requested");
    expect(summary).toContain("sound on at 55 percent volume");
    expect(summary).toContain(audioState.modeLabel);
    expect(summary).toContain(`${audioState.tempo} BPM`);
  });

  it("uses stable wording while automatic complexity is moving", () => {
    const generationState = buildGenerationState(traits, options);
    const audioState = buildAudioState(generationState);

    const summary = buildAccessibilitySummary({
      generationState,
      audioState,
      isAnimating: true,
      isAudioEnabled: true,
      audioVolume: 0.55,
      prefersReducedMotion: false,
    });

    expect(summary).toContain("Complexity is sliding automatically");
    expect(summary).toContain("visual motion and audio variation are changing together");
    expect(summary).toContain("tempo and event density changing");
    expect(summary).not.toContain(`${audioState.tempo} BPM`);
  });
});
