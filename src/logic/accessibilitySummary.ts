import { STYLES } from "../components/art/styleRegistry";
import type { AudioState } from "./audioMapping";
import { getAudioModeExperienceDescription } from "./experienceDescriptions";
import type { GenerationState } from "./types";

interface AccessibilitySummaryOptions {
  generationState: GenerationState;
  audioState: AudioState;
  isAnimating: boolean;
  isAudioEnabled: boolean;
  audioVolume: number;
  prefersReducedMotion: boolean;
}

function getStyleLabel(styleId: GenerationState["styleId"]): string {
  return STYLES[styleId]?.label ?? styleId;
}

function getPaletteSummary(palette: string[]): string {
  if (!palette.length) return "no generated colors";
  return `${palette.length} generated colors`;
}

export function buildAccessibilitySummary({
  generationState,
  audioState,
  isAnimating,
  isAudioEnabled,
  audioVolume,
  prefersReducedMotion,
}: AccessibilitySummaryOptions): string {
  const styleLabel = getStyleLabel(generationState.styleId);
  const animationState = isAnimating
    ? "automatic complexity on; visual motion and audio variation are changing together"
    : "automatic complexity off; visual complexity and audio variation are static";
  const complexityState = isAnimating
    ? "Complexity is sliding automatically."
    : `Complexity ${Math.round(generationState.complexity)}.`;
  const motionPreference = prefersReducedMotion
    ? "reduced motion requested"
    : "standard motion";
  const soundState = isAudioEnabled
    ? `sound on at ${Math.round(audioVolume * 100)} percent volume`
    : "sound off";

  return [
    `DatArt generated ${styleLabel}.`,
    `Mode ${generationState.seedSource === "manualDial" ? "manual seed" : "automatic"}.`,
    complexityState,
    `${animationState}; ${motionPreference}.`,
    `${soundState}.`,
    `Audio profile: ${getAudioModeExperienceDescription(audioState, isAnimating)}.`,
    `Palette has ${getPaletteSummary(generationState.palette)}.`,
  ].join(" ");
}
