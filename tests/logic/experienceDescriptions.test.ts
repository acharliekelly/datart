import { describe, expect, it } from "vitest";
import { buildAudioState } from "../../src/logic/audioMapping";
import {
  getAudioModeExperienceDescription,
  getAudioModeDescription,
  getVisualStyleDescription,
} from "../../src/logic/experienceDescriptions";
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
  manualStyle: "koch",
  complexity: 60,
  paletteShift: 0,
};

describe("experience descriptions", () => {
  it("describes the visual style and audio mode choices", () => {
    const generationState = buildGenerationState(traits, options);
    const audioState = buildAudioState(generationState);

    expect(getVisualStyleDescription(generationState.styleId)).toContain(
      "Koch snowflake"
    );
    expect(getAudioModeDescription(audioState)).toContain(audioState.modeLabel);
    expect(getAudioModeDescription(audioState)).toContain(audioState.scaleName);
  });

  it("describes moving audio without changing numeric values", () => {
    const generationState = buildGenerationState(traits, options);
    const audioState = buildAudioState(generationState);
    const description = getAudioModeExperienceDescription(audioState, true);

    expect(description).toContain(audioState.modeLabel);
    expect(description).toContain(audioState.scaleName);
    expect(description).toContain("tempo and event density changing");
    expect(description).not.toContain(`${audioState.tempo} BPM`);
    expect(description).not.toContain(`${audioState.notes.length} generated events`);
  });
});
