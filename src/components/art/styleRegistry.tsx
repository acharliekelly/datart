import OrbitArt from "./Orbits";
import StrataArt from "./Strata";
import ConstellationArt from "./Constellation";
import BubblesArt from "./Bubbles";
import WaveArt from "./Wave";
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
} as const;

export type StyleId = keyof typeof STYLES;

export type StyleComponent = React.FC<ArtStyleProps>;