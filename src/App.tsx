import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Mode,
  StyleId,
  GenerationState,
  GenerationOptions,
  UserTraits
} from './logic/types';

import { buildGenerationState, } from './logic/generation';
import { getBaseTraits, applyIpInfo } from "./logic/fingerprint";
import DebugPanel from "./components/ui/DebugPanel";
import ControlPanel from "./components/ui/ControlPanel";
import ArtContainer from "./components/ui/ArtContainer";
import { useIpInfo } from "./hooks/useIpInfo";
import "./App.css";



/* ===========================================
 *  APP ROOT
 * ===========================================
 */

const App: React.FC = () => {
  // 1) traits
  const [traits, setTraits] = useState<UserTraits>(() => getBaseTraits());
  
  const { ipInfo, loading: ipLoaded, error: ipError } = useIpInfo();

  useEffect(() => {
    if (!ipInfo) return;
    setTraits((prev) => applyIpInfo(prev, ipInfo));
  }, [ipInfo]);

  
  // 2) options - SINGLE source of truth for mode
  const [options, setOptions] = useState<GenerationOptions>({
    mode: "auto",
    manualSeed: null,
    manualStyle: null,
    complexity: 50,
    paletteShift: 0,
  });

  // 3) derived generation state
  const generationState = useMemo<GenerationState>(
    () => buildGenerationState(traits, options),
      [traits, options]
  );

  // 4) handlers that only ever update "options"
  const handleModeChange = (mode: Mode) =>
    setOptions((prev) => ({ ...prev, mode }));

  const handleSeedChange = (seed: number | null) => 
    setOptions((prev) => ({ ...prev, manualSeed: seed }));

  const handleStyleChange = (style: StyleId | null) =>
    setOptions((prev) => ({ ...prev, manualStyle: style }));

  const handleComplexityChange = (value: number) =>
    setOptions((prev) => ({ ...prev, complexity: value }));

  const handleShufflePalette = () => 
    setOptions((prev) => ({
      ...prev,
      paletteShift: (prev.paletteShift ?? 0) + 1,
    }));


  return (
    <div className="art-root">
      <ArtContainer state={generationState} />
      <div className="art-label">
        datart · {generationState.styleId} · client-side generative
      </div>
      <ControlPanel
        mode={options.mode}
        manualSeed={options.manualSeed ?? null}
        manualStyle={options.manualStyle ?? null}
        complexity={options.complexity ?? 50}
        onModeChange={handleModeChange}
        onSeedChange={handleSeedChange}
        onStyleChange={handleStyleChange}
        onComplexityChange={handleComplexityChange}
        onShufflePalette={handleShufflePalette}
      />
      <DebugPanel 
        state={generationState} 
        ipLoaded={ipLoaded}
        mode={options.mode} 
        ipError={ipError}
      />
    </div>
  );
};

export default App;
