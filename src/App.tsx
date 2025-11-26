import React, {
  useEffect,
  useMemo,
  useRef,
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
import MiniHud from "./components/ui/MiniHud";
import { useIpInfo } from "./hooks/useIpInfo";
import { useIsMobile } from "./hooks/useIsMobile";
import "./App.css";


const App: React.FC = () => {
  const [traits, setTraits] = useState<UserTraits>(() => getBaseTraits());
  const [isAnimating, setIsAnimating] = useState(false);
  const [hudHidden, setHudHidden] = useState(false);
  const complexityDirectionRef = useRef<1 | -1>(1);
  
  const { ipInfo, loading: ipLoaded, error: ipError } = useIpInfo();
  const isMobile = useIsMobile();

  const [options, setOptions] = useState<GenerationOptions>({
    mode: "auto",
    manualSeed: null,
    manualStyle: null,
    complexity: 50,
    paletteShift: 0,
  });

  const generationState = useMemo<GenerationState>(
    () => buildGenerationState(traits, options),
      [traits, options]
  );

  useEffect(() => {
    if (!isAnimating) return;

    let frameId: number;
    let lastTime = performance.now();

    const speed = 30;

    const step = (timestamp: number) => {
      const dt = (timestamp - lastTime) / 1000; // seconds
      lastTime = timestamp;

      setOptions((prev) => {
        const current = prev.complexity ?? 50;
        let dir = complexityDirectionRef.current;

        let next = current + dir * speed * dt;

        if (next >= 100) {
          next = 100;
          dir = -1;
        } else if (next <= 0) {
          next = 0;
          dir = 1;
        }

        complexityDirectionRef.current = dir;

        return { ...prev, complexity: next };
      });
      frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);

    if (ipInfo) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTraits((prev) => applyIpInfo(prev, ipInfo));
    }

    return () => {
      cancelAnimationFrame(frameId);
    }
    
  }, [ipInfo, isAnimating, setOptions]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        setHudHidden((h) => !h);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  
  // handlers that only ever update "options"
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

  const handleToggleAnimation = () => {
    setIsAnimating((prev) => !prev);
  }


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
        isAnimating={isAnimating}
        onToggleAnimation={handleToggleAnimation}
        isMobile={isMobile}
        hudHidden={hudHidden}
      />
      <DebugPanel 
        state={generationState} 
        ipLoaded={ipLoaded}
        mode={options.mode} 
        ipError={ipError}
        isMobile={isMobile}
        hudHidden={hudHidden}
      />
      <MiniHud
        mode={options.mode}
        manualStyle={options.manualStyle ?? null}
        effectiveStyle={generationState.styleId}
        isAnimating={isAnimating}
        onModeChange={handleModeChange}
        onStyleChange={handleStyleChange}
        onToggleAnimation={handleToggleAnimation}
      />
    </div>
  );
};

export default App;
