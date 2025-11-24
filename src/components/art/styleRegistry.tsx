import OrbitArt from "./OrbitArt";
import StrataArt from "./StrataArt";
import ConstellationArt from "./ConstellationArt";
import BubblesArt from "./BubblesArt";
import WaveArt from "./WaveArt";
import SupershapeArt from "./SupershapeArt";
import type { ArtStyleProps } from "../../logic/types";

export const STYLES: Record<
  string,
  { id: string; label: string; component: StyleComponent }
> = {
  orbits: {
    id: "orbits",
    label: "Orbits",
    component: OrbitArt,
  },
  strata: {
    id: "strata",
    label: "Strata",
    component: StrataArt,
  },
  constellation: {
    id: "constellation",
    label: "Constellation",
    component: ConstellationArt,
  },
  bubbles: {
    id: "bubbles",
    label: "Bubbles",
    component: BubblesArt,
  },
  waves: {
    id: "waves",
    label: "Waves",
    component: WaveArt,
  },
  supershape: {
    id: "supershape",
    label: "Supershape Stars",
    component: SupershapeArt,
  },
} as const;

export type StyleId = keyof typeof STYLES;

export type StyleComponent = React.FC<ArtStyleProps>;