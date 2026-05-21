import { STYLES } from "../components/art/styleRegistry";
import type { AudioState } from "./audioMapping";
import type { StyleId } from "./types";

const VISUAL_DESCRIPTIONS: Record<StyleId, string> = {
  orbits: "drifting concentric circles arranged like orbital paths",
  strata: "layered bands inspired by geological sediment",
  constellation: "stars connected by glowing colored paths",
  bubbles: "translucent floating spheres with soft highlights",
  waves: "soft interference bands that sweep across the screen",
  supershape: "a filled superformula shape with radial color",
  isogrid: "a field of layered isometric tiles",
  crystal: "angular shards arranged like refracted crystal",
  lattice: "a connected field of nodes and luminous links",
  nebula: "soft atmospheric clouds and glowing color fields",
  aurora: "vertical curtains of blurred light",
  voronoi: "a cellular bloom built from blurred color regions",
  fern: "a fractal fern point cloud",
  koch: "a filled fractal pattern based on the Koch snowflake",
  tree: "a recursive branching tree structure",
  flowfield: "curving paths guided by a generated flow field",
};

export function getVisualStyleDescription(styleId: StyleId): string {
  const label = STYLES[styleId]?.label ?? styleId;
  return `${label}: ${VISUAL_DESCRIPTIONS[styleId] ?? "a generated visual composition"}`;
}

export function getAudioModeDescription(audioState: AudioState): string {
  return getStaticAudioModeDescription(audioState);
}

export function getStaticAudioModeDescription(audioState: AudioState): string {
  return `${audioState.modeLabel}: ${audioState.scaleName} scale, ${audioState.waveform} wave, ${audioState.tempo} BPM, ${audioState.notes.length} generated events`;
}

export function getMovingAudioModeDescription(audioState: AudioState): string {
  return `${audioState.modeLabel}: ${audioState.scaleName} scale and ${audioState.waveform} wave, with tempo and event density changing as complexity slides`;
}

export function getAudioModeExperienceDescription(
  audioState: AudioState,
  isAnimating: boolean
): string {
  return isAnimating
    ? getMovingAudioModeDescription(audioState)
    : getStaticAudioModeDescription(audioState);
}
