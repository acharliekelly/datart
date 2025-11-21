// /src/logic/generation.ts

import type {
  GenerationOptions,
  GenerationState,
  StyleId,
  UserTraits
} from "./types";
import { buildFingerprint } from "./fingerprint";
import { hashStringToInt, makeRng } from "./rng";
import { generatePalette } from "./palette";
import { chooseStyle } from "./styleRules";


/**
 * Given traits (browser + optional IP), compute:
 * - fingerprint
 * - seed
 * - palette
 * - styleId
 */
export function buildGenerationState(
  traits: UserTraits,
  options: GenerationOptions
): GenerationState {
  const fingerprint = buildFingerprint(traits);
  const baseSeed = hashStringToInt(fingerprint);
  const effectiveSeed = 
    options.mode === "manual" && options.manualSeed != null
      ? options.manualSeed
      : baseSeed;
  const rngForPalette = makeRng(effectiveSeed);
  const palette = generatePalette(rngForPalette);
  const autoStyle = chooseStyle(traits, effectiveSeed);
  const effectiveStyle: StyleId =
    options.mode === "manual" && options.manualStyle
      ? options.manualStyle
      : autoStyle;

  return {
    traits,
    fingerprint,
    seed: effectiveSeed,
    palette,
    styleId: effectiveStyle,
  };
}

