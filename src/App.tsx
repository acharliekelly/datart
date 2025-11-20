import React, {
  useEffect,
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
import * as ut from './utils/userTraits';
import OrbitArt from "./components/Orbits";
import StrataArt from "./components/Strata";
import ConstellationArt from "./components/Constellation";
import DebugPanel from "./components/DebugPanel";
import "./App.css";
import ControlPanel from "./components/ControlPanel";


/* ===========================================
 *  APP ROOT
 * ===========================================
 */

const App: React.FC = () => {
  const [traits, setTraits] = useState<UserTraits>(() => ut.getBaseTraits());
  const [ipLoaded, setIpLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("auto");
  const [manualSeed, setManualSeed] = useState<number | null>(null);
  const [manualStyle, setManualStyle] = useState<StyleId | null>(null);


  // After mount, fetch IP info and recompute state including IP.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ipInfo = await ut.fetchIpInfo();
      if (cancelled || !ipInfo) return;

      setTraits((prev) => ({
        ...prev,
          ipInfo,
      }));
      setIpLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [traits]);

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
      />
    </div>
  );
};

export default App;
