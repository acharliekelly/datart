import OrbitArt from "../styles/Orbits";
import StrataArt from "../styles/Strata";
import ConstellationArt from "../styles/Constellation";
import BubblesArt from "../styles/Bubbles";
import type { StyleId, BaseArtProps } from "./types";

export const STYLE_COMPONENTS: Record<StyleId, React.FC<BaseArtProps>> = {
  orbits: OrbitArt,
  strata: StrataArt,
  constellation: ConstellationArt,
  bubbles: BubblesArt,
};