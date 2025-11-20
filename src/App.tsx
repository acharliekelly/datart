import React, {
  useMemo,
  useState,
} from "react";
import {
  type UserTraits,
  type ArtStyleProps,
  type Mode,
  type StyleId,
  type GenerationState
} from './utils/types';
import * as ut from './utils/fingerprint';
import OrbitArt from "./components/Orbits";
import StrataArt from "./components/Strata";
import ConstellationArt from "./components/Constellation";
import DebugPanel from "./components/DebugPanel";
import "./App.css";
import ControlPanel from "./components/ControlPanel";
import { useIpInfo } from "./hooks/useIpInfo";


/* ===========================================
 *  APP ROOT
 * ===========================================
 */

const App: React.FC = () => {
  // const [traits, setTraits] = useState<UserTraits>(() => ut.getBaseTraits());

  const baseTraits = useMemo<UserTraits>(() => ut.getBaseTraits(), []);
  
  const { ipInfo, loading: ipLoading, error: ipError } = useIpInfo();

  const traits = useMemo<UserTraits>(() => {
    if (!ipInfo) return baseTraits;
    return { ...baseTraits, ipInfo };
  }, [baseTraits, ipInfo]);

  const [mode, setMode] = useState<Mode>("auto");
  const [manualSeed, setManualSeed] = useState<number | null>(null);
  const [manualStyle, setManualStyle] = useState<StyleId | null>(null);

  const ipLoaded = !!ipInfo && !ipLoading;

  const generationState = useMemo<GenerationState>(
    () =>
      ut.buildGenerationState(traits, {
        mode,
        manualSeed,
        manualStyle
      }),
      [traits, mode, manualSeed, manualStyle]
  );

  const { styleId, palette, seed } = generationState;

  let StyleComponent: React.FC<ArtStyleProps> = OrbitArt;
  if (styleId === "strata") StyleComponent = StrataArt;
  if (styleId === "constellation") StyleComponent = ConstellationArt;

  return (
    <div className="art-root">
      <StyleComponent seed={seed} palette={palette} />
      <div className="art-label">
        datart · {styleId} · client-side generative
      </div>
      <ControlPanel
        mode={mode}
        manualSeed={manualSeed}
        manualStyle={manualStyle}
        onModeChange={setMode}
        onSeedChange={setManualSeed}
        onStyleChange={setManualStyle}
      />
      <DebugPanel 
        state={generationState} 
        ipLoaded={ipLoaded}
        mode={mode} 
        ipError={ipError}
      />
    </div>
  );
};

export default App;
