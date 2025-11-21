import React, {
  useMemo,
  useState,
} from "react";
import type {
  Mode,
  BaseArtProps,
  StyleId,
  AllStyleOptions,
  GenerationState,
  UserTraits
} from './utils/types';
import * as fp from './utils/fingerprint';
import { STYLE_COMPONENTS } from "./utils/style";
import OrbitArt from "./styles/Orbits";
import StrataArt from "./styles/Strata";
import ConstellationArt from "./styles/Constellation";
import BubblesArt from "./styles/Bubbles";
import DebugPanel from "./components/DebugPanel";
import ControlPanel from "./components/ControlPanel";
import { useIpInfo } from "./hooks/useIpInfo";
import "./App.css";



/* ===========================================
 *  APP ROOT
 * ===========================================
 */

const App: React.FC = () => {
  const baseTraits = useMemo<UserTraits>(() => fp.getBaseTraits(), []);
  
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
      fp.buildGenerationState(traits, {
        mode,
        manualSeed,
        manualStyle
      }),
      [traits, mode, manualSeed, manualStyle]
  );

  const { styleId, palette, seed } = generationState;

  const StyleComponent = STYLE_COMPONENTS[styleId] ?? STYLE_COMPONENTS.orbits;
  const currentOptions = styleOptions[styleId];

  return (
    <div className="art-root">
      <StyleComponent 
        seed={seed} 
        palette={palette} 
        options={currentOptions} 
      />
      <div className="art-label">
        datart · {styleId} · client-side generative
      </div>
      <ControlPanel
        mode={mode}
        manualSeed={manualSeed}
        manualStyle={manualStyle}
        effectiveStyleId={styleId}
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
