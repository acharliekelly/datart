import { STYLES } from "../components/art/styleRegistry";
import type { AudioState } from "./audioMapping";
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
  const animationState = isAnimating ? "animation on" : "animation off";
  const motionPreference = prefersReducedMotion
    ? "reduced motion requested"
    : "standard motion";
  const soundState = isAudioEnabled
    ? `sound on at ${Math.round(audioVolume * 100)} percent volume`
    : "sound off";

  return [
    `DatArt generated ${styleLabel}.`,
    `Mode ${generationState.seedSource === "manualDial" ? "manual seed" : "automatic"}.`,
    `Complexity ${Math.round(generationState.complexity)}.`,
    `${animationState}; ${motionPreference}.`,
    `${soundState}.`,
    `Audio profile: ${audioState.summary}.`,
    `Palette has ${getPaletteSummary(generationState.palette)}.`,
  ].join(" ");
}
