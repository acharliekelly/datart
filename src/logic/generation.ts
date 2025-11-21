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

  // NEW: manualSeed is treated as a small "dial" (0-100),
  // used to perturb the fingerprint before hashing
  let effectiveSeed = baseSeed;

  if (options.mode === "manual" && options.manualSeed != null) {
    const dial = options.manualSeed;
    const dialString = `${fingerprint}|dial:${dial}`;
    effectiveSeed = hashStringToInt(dialString);
  }

  
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

