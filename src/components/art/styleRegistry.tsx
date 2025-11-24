import type { ArtStyleProps } from "../../logic/types";
import OrbitArt from "./OrbitArt";
import StrataArt from "./StrataArt";
import ConstellationArt from "./ConstellationArt";
import BubblesArt from "./BubblesArt";
import WaveArt from "./WaveArt";
import SupershapeArt from "./SupershapeArt";
import IsoGridArt from "./IsoGridArt";
import CrystalArt from "./CrystalArt";
import LatticeArt from "./LatticeArt";
import NebulaArt from "./NebulaArt";
import AuroraArt from "./AuroraArt";
import VoronoiBloomArt from "./VoronoiBloomArt";
import FernArt from "./FernArt";
import KochSnowflakeArt from "./KochSnowflakeArt";
import RecursiveTreeArt from "./RecursiveTreeArt";
import FlowFieldArt from "./FlowFieldArt";

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
  isogrid: {
    id: "isogrid",
    label: "IsoGrid",
    component: IsoGridArt,
  },
  crystal: {
    id: "crystal",
    label: "Crystal",
    component: CrystalArt,
  },
  lattice: {
    id: "lattice",
    label: "Lattice",
    component: LatticeArt,
  },
  nebula: {
    id: "nebula",
    label: "Nebula",
    component: NebulaArt,
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    component: AuroraArt,
  },
  voronoi: {
    id: "voronoi",
    label: "Voronoi Bloom",
    component: VoronoiBloomArt,
  },
  fern: {
    id: "fern",
    label: "Fractal Fern",
    component: FernArt,
  },
  koch: {
    id: "koch",
    label: "Koch Snowflake",
    component: KochSnowflakeArt,
  },
  tree: {
    id: "tree",
    label: "Recursive Tree",
    component: RecursiveTreeArt,
  },
  flowfield: {
    id: "flowfield",
    label: "Flow Field",
    component: FlowFieldArt,
  },
} as const;

export type StyleId = keyof typeof STYLES;

export type StyleComponent = React.FC<ArtStyleProps>;