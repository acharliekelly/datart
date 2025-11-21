import React from "react";
import type { GenerationState } from "../../logic/types";
import { STYLES } from "../art/styleRegistry";

interface ArtContainerProps {
  state: GenerationState;
}

const ArtContainer: React.FC<ArtContainerProps> = ({ state }) => {
  const { styleId, seed, palette } = state;
  const styleEntry = STYLES[styleId];

  const StyleComponent = styleEntry.component;

  return <StyleComponent seed={seed} palette={palette} />;
};

export default ArtContainer;