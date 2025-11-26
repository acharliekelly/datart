// /src/logic/generation.ts

import type {
  GenerationOptions,
  GenerationState,
  UserTraits
} from "./types";
import { buildFingerprint } from "./fingerprint";
import { hashStringToInt, makeRng } from "./rng";
import { generatePalette } from "./palette";
import { chooseStyleFromFingerprint } from "./styleRules";

function shiftPalette(palette: string[], shift: number): string[] {
  if (!palette.length) return palette;
  const n = palette.length;
  const offset = ((shift % n) + n) %n;
  if (offset === 0) return palette;
  return [...palette.slice(offset), ...palette.slice(0, offset)];
}

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

  const complexity = options.complexity ?? 50;  // 0-100
  const paletteShift = options.paletteShift ?? 0;

  let seedSource: "auto" | "manualDial" = "auto";
  let seedDial: number | null = null;

  let effectiveSeed = baseSeed;

  if (options.mode === "manual" && options.manualSeed != null) {
    seedSource = "manualDial";
    seedDial = options.manualSeed;
    const dialString = `${fingerprint}|dial:${seedDial}`;
    effectiveSeed = hashStringToInt(dialString);
  }
  
  const rngForPalette = makeRng(effectiveSeed);
  const rawPalette = generatePalette(rngForPalette);
  const palette = shiftPalette(rawPalette, paletteShift);

  // const styleDecision = chooseStyle(traits, effectiveSeed);
  const styleDecision = chooseStyleFromFingerprint(traits);
  const autoReason = styleDecision.reason;
  const effectiveStyle =
    options.mode === "manual" && options.manualStyle
      ? options.manualStyle
      : styleDecision.id;

  return {
    traits,
    fingerprint,
    baseSeed,
    seed: effectiveSeed,
    seedSource,
    seedDial,
    styleId: effectiveStyle,
    styleReason: options.mode === "manual" && options.manualStyle
      ? `manual override >> ${effectiveStyle}`
      : autoReason,
    palette,
    paletteShift,
    complexity,
  };
}

