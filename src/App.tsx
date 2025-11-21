import React, {
  useMemo,
  useState,
} from "react";
import type {
  Mode,
  StyleId,
  AllStyleOptions,
  GenerationState,
  UserTraits
} from './logic/types';

import { buildGenerationState } from './logic/generation';
import { getBaseTraits } from "./logic/fingerprint";
import DebugPanel from "./components/ui/DebugPanel";
import ControlPanel from "./components/ui/ControlPanel";
import { ArtContainer } from "./components/ui/ArtContainer";
import { useIpInfo } from "./hooks/useIpInfo";
import "./App.css";



/* ===========================================
 *  APP ROOT
 * ===========================================
 */

const App: React.FC = () => {
  const baseTraits = useMemo<UserTraits>(() => getBaseTraits(), []);
  
  const { ipInfo, loading: ipLoading, error: ipError } = useIpInfo();

  const traits = useMemo<UserTraits>(() => {
    if (!ipInfo) return baseTraits;
    return { ...baseTraits, ipInfo };
  }, [baseTraits, ipInfo]);

  const [mode, setMode] = useState<Mode>("auto");
  const [manualSeed, setManualSeed] = useState<number | null>(null);
  const [manualStyle, setManualStyle] = useState<StyleId | null>(null);
  const [styleOptions, setStyleOptions] = useState<AllStyleOptions>(() => ({
    orbits: {
      ringCount: 14,
      jitter: 80,
    },
    bubbles: {
      bubbleCount: 26,
      spread: 220,
    },
    strata: {
      bandCount: 16,
      maxTilt: 8,
    },
    constellation: {
      pointCount: 24,
      connectionChance: 0.6,
    },
  }));

  const ipLoaded = !!ipInfo && !ipLoading;

  const generationState = useMemo<GenerationState>(
    () =>
      buildGenerationState(traits, {
        mode,
        manualSeed,
        manualStyle
      }),
      [traits, mode, manualSeed, manualStyle]
  );


  return (
    <div className="art-root">
      <ArtContainer state={generationState} />
      <div className="art-label">
        datart · {generationState.styleId} · client-side generative
      </div>
      <ControlPanel
        mode={mode}
        manualSeed={manualSeed}
        manualStyle={manualStyle}
        effectiveStyleId={generationState.styleId}
        styleOptions={styleOptions}
        onModeChange={setMode}
        onSeedChange={setManualSeed}
        onStyleChange={setManualStyle}
        onStyleOptionsChange={setStyleOptions}
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
