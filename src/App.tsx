import React, {
  useEffect,
  useState,
} from "react";
import type {
  UserTraits,
  ArtStyleProps,
  GenerationState
} from './utils/types';
import * as traits from './utils/userTraits';
import OrbitArt from "./components/Orbits";
import StrataArt from "./components/Strata";
import ConstellationArt from "./components/Constellation";
import DebugPanel from "./components/DebugPanel";
import "./App.css";


/* ===========================================
 *  APP ROOT
 * ===========================================
 */

const App: React.FC = () => {
  const [generationState, setGenerationState] = useState<GenerationState>(
    () => {
      const baseTraits = traits.getBaseTraits();
      return traits.buildGenerationState(baseTraits);
    }
  );

  const [ipLoaded, setIpLoaded] = useState(false);

  // After mount, fetch IP info and recompute state including IP.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ipInfo = await traits.fetchIpInfo();
      if (cancelled || !ipInfo) return;

      setGenerationState((prev) => {
        const traitsWithIp: UserTraits = {
          ...prev.traits,
          ipInfo,
        };
        return traits.buildGenerationState(traitsWithIp);
      });

      setIpLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      <DebugPanel state={generationState} ipLoaded={ipLoaded} />
    </div>
  );
};

export default App;
