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
import { buildAccessibilitySummary } from "./logic/accessibilitySummary";
import { getAudioModeExperienceDescription } from "./logic/experienceDescriptions";
import { getBaseTraits, applyIpInfo } from "./logic/fingerprint";
import DebugPanel from "./components/ui/DebugPanel";
import ControlPanel from "./components/ui/ControlPanel";
import ArtContainer from "./components/ui/ArtContainer";
import MiniHud from "./components/ui/MiniHud";
import { useIpInfo } from "./hooks/useIpInfo";
import { useIsMobile } from "./hooks/useIsMobile";
import { useSonification } from "./hooks/useSonification";
import "./App.css";

const STARTING_ANIMATION_STATE = false;
const NORMAL_ANIMATION_FPS = 12;
const REDUCED_MOTION_ANIMATION_FPS = 4;
const NORMAL_COMPLEXITY_SPEED = 24;
const REDUCED_MOTION_COMPLEXITY_SPEED = 8;


const App: React.FC = () => {
  const [baseTraits] = useState<UserTraits>(() => getBaseTraits());
  const [isAnimating, setIsAnimating] = useState(STARTING_ANIMATION_STATE);
  const [hudHidden, setHudHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const complexityDirectionRef = useRef<1 | -1>(1);
  const animationUserOverrideRef = useRef(false);
  
  const { ipInfo, loading: ipLoaded, error: ipError } = useIpInfo();
  const isMobile = useIsMobile();

  const [options, setOptions] = useState<GenerationOptions>({
    mode: "auto",
    manualSeed: null,
    manualStyle: null,
    complexity: 50,
    paletteShift: 0,
  });

  const traits = useMemo<UserTraits>(() => {
    if (!ipInfo) return baseTraits;
    return applyIpInfo(baseTraits, ipInfo);
  }, [baseTraits, ipInfo]);

  const generationState = useMemo<GenerationState>(
    () => buildGenerationState(traits, options),
      [traits, options]
  );
  const {
    audioState,
    isAudioEnabled,
    audioVolume,
    audioError,
    toggleAudio,
    setAudioVolume,
  } = useSonification(generationState);
  const accessibilitySummary = useMemo(
    () =>
      buildAccessibilitySummary({
        generationState,
        audioState,
        isAnimating,
        isAudioEnabled,
        audioVolume,
        prefersReducedMotion,
      }),
    [
      audioState,
      audioVolume,
      generationState,
      isAnimating,
      isAudioEnabled,
      prefersReducedMotion,
    ]
  );
  const audioExperienceSummary = useMemo(
    () => getAudioModeExperienceDescription(audioState, isAnimating),
    [audioState, isAnimating]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPrefersReducedMotion(query.matches);
      if (query.matches && !animationUserOverrideRef.current) {
        setIsAnimating(false);
      }
    };

    update();
    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    let frameId: number;
    let lastTime = performance.now();
    let lastUpdateTime = lastTime;

    const fps = prefersReducedMotion
      ? REDUCED_MOTION_ANIMATION_FPS
      : NORMAL_ANIMATION_FPS;
    const frameInterval = 1000 / fps;
    const speed = prefersReducedMotion
      ? REDUCED_MOTION_COMPLEXITY_SPEED
      : NORMAL_COMPLEXITY_SPEED;

    const step = (timestamp: number) => {
      frameId = requestAnimationFrame(step);

      if (timestamp - lastUpdateTime < frameInterval) {
        return;
      }

      const dt = (timestamp - lastTime) / 1000; // seconds
      lastTime = timestamp;
      lastUpdateTime = timestamp;

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

        const roundedNext = Math.round(next);
        if (Math.round(current) === roundedNext) return prev;

        return { ...prev, complexity: roundedNext };
      });
    }

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
    }
    
  }, [isAnimating, prefersReducedMotion]);

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
    animationUserOverrideRef.current = true;
    setIsAnimating((prev) => !prev);
  }


  return (
    <div className="art-root">
      <div className="sr-only" role="status" aria-live="polite">
        {accessibilitySummary}
      </div>
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
        isAudioEnabled={isAudioEnabled}
        audioVolume={audioVolume}
        audioSummary={audioExperienceSummary}
        audioError={audioError}
        onToggleAudio={toggleAudio}
        onAudioVolumeChange={setAudioVolume}
        isMobile={isMobile}
        hudHidden={hudHidden}
      />
      <MiniHud
        mode={options.mode}
        manualStyle={options.manualStyle ?? null}
        effectiveStyle={generationState.styleId}
        isAnimating={isAnimating}
        isAudioEnabled={isAudioEnabled}
        audioModeLabel={audioState.modeLabel}
        onModeChange={handleModeChange}
        onStyleChange={handleStyleChange}
        onToggleAnimation={handleToggleAnimation}
        onToggleAudio={toggleAudio}
      />
      <DebugPanel 
        state={generationState} 
        audioState={audioState}
        isAnimating={isAnimating}
        ipLoaded={ipLoaded}
        mode={options.mode} 
        ipError={ipError}
        isMobile={isMobile}
        hudHidden={hudHidden}
      />
    </div>
  );
};

export default App;
