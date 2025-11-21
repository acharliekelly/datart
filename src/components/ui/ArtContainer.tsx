import React from "react";
import type { GenerationState, ArtStyleProps } from "../../logic/types";
import OrbitArt from "../art/Orbits";
import StrataArt from "../art/Strata";
import ConstellationArt from "../art/Constellation";
import BubblesArt from "../art/Bubbles";

interface ArtContainerProps {
  state: GenerationState;
}

export const ArtContainer: React.FC<ArtContainerProps> = ({ state }) => {
  const { styleId, seed, palette } = state;

  let StyleComponent: React.FC<ArtStyleProps> = OrbitArt;
  if (styleId === "strata") StyleComponent = StrataArt;
  if (styleId === "constellation") StyleComponent = ConstellationArt;
  if (styleId === "bubbles") StyleComponent = BubblesArt;

  return <StyleComponent seed={seed} palette={palette} />;
};
