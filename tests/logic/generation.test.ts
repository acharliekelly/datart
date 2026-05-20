import { describe, expect, it } from "vitest";
import { buildGenerationState } from "../../src/logic/generation";
import type { GenerationOptions, UserTraits } from "../../src/logic/types";

const baseTraits: UserTraits = {
  timeZone: "America/New_York",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  language: "en-US",
  screenWidth: 1440,
  screenHeight: 900,
  devicePixelRatio: 2,
  darkMode: true,
  ipInfo: {
    ip: "198.51.100.42",
    city: "Example City",
    region: "Example Region",
    country: "Example Country",
    continentCode: "NA",
  },
};

const autoOptions: GenerationOptions = {
  mode: "auto",
  manualSeed: null,
  manualStyle: null,
  complexity: 50,
  paletteShift: 0,
};

describe("buildGenerationState", () => {
  it("is deterministic for the same traits and options", () => {
    const first = buildGenerationState(baseTraits, autoOptions);
    const second = buildGenerationState(baseTraits, autoOptions);

    expect(second).toEqual(first);
  });

  it("uses the manual seed dial to perturb the effective seed", () => {
    const autoState = buildGenerationState(baseTraits, autoOptions);
    const manualState = buildGenerationState(baseTraits, {
      ...autoOptions,
      mode: "manual",
      manualSeed: 73,
    });

    expect(manualState.seedSource).toBe("manualDial");
    expect(manualState.seedDial).toBe(73);
    expect(manualState.seed).not.toBe(autoState.seed);
  });

  it("honors a manual style override without changing the selected palette length", () => {
    const state = buildGenerationState(baseTraits, {
      ...autoOptions,
      mode: "manual",
      manualStyle: "tree",
    });

    expect(state.styleId).toBe("tree");
    expect(state.styleReason).toBe("manual override >> tree");
    expect(state.palette).toHaveLength(5);
  });

  it("rotates palettes without changing the colors", () => {
    const original = buildGenerationState(baseTraits, autoOptions);
    const shifted = buildGenerationState(baseTraits, {
      ...autoOptions,
      paletteShift: 2,
    });

    expect(shifted.palette).toEqual([
      ...original.palette.slice(2),
      ...original.palette.slice(0, 2),
    ]);
  });
});
