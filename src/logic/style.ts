import OrbitArt from "../components/art/Orbits";
import StrataArt from "../components/art/Strata";
import ConstellationArt from "../components/art/Constellation";
import BubblesArt from "../components/art/Bubbles";
import type { StyleId, BaseArtProps } from "./types";

export const STYLE_COMPONENTS: Record<StyleId, React.FC<BaseArtProps>> = {
  orbits: OrbitArt,
  strata: StrataArt,
  constellation: ConstellationArt,
  bubbles: BubblesArt,
};