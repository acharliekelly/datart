import React from "react";
import type { ArtStyleProps, GenerationState } from "../../logic/types";
import { STYLES } from "../art/styleRegistry";

interface ArtContainerProps {
  state: GenerationState;
}

const ArtContainer: React.FC<ArtContainerProps> = ({ state }) => {
  const { styleId, seed, palette, complexity } = state;
  const styleEntry = STYLES[styleId];

  if (!styleEntry) {
    // defensive fallback so app doesn't crash
    console.warn(
      "[ArtContainer] Unknown styleId:",
      styleId,
      "Available styles:",
      Object.keys(STYLES)
    );

    const Fallback = STYLES.orbits?.component as React.FC<ArtStyleProps>;

    return (
      <Fallback
        seed={seed}
        palette={palette}
        complexity={complexity}
      />
    );
  }

  const StyleComponent = styleEntry.component;

  return <StyleComponent 
    seed={seed} 
    palette={palette} 
    complexity={complexity}
  />;
};

export default ArtContainer;