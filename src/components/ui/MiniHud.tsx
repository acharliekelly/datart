import React from "react";
import type { Mode, StyleId } from "../../logic/types";
import { STYLES } from "../art/styleRegistry";
import "./MiniHud.css";

interface MiniHudProps {
  mode: Mode;
  manualStyle: StyleId | null;
  effectiveStyle: StyleId;
  isAnimating: boolean;
  isAudioEnabled: boolean;
  onModeChange: (mode: Mode) => void;
  onStyleChange: (style: StyleId | null) => void;
  onToggleAnimation: () => void;
  onToggleAudio: () => void | Promise<void>;
}

const STYLE_IDS: StyleId[] = Object.values(STYLES).map((s) => s.id);

function getNextStyleId(current: StyleId, direction: 1 | -1): StyleId {
  const idx = STYLE_IDS.indexOf(current);
  const safeIdx = idx === -1 ? 0 : idx;
  const next = (safeIdx + direction + STYLE_IDS.length) % STYLE_IDS.length;
  return STYLE_IDS[next];
}

const MiniHud: React.FC<MiniHudProps> = ({
  mode, 
  manualStyle,
  effectiveStyle,
  isAnimating,
  isAudioEnabled,
  onModeChange,
  onStyleChange,
  onToggleAnimation,
  onToggleAudio,
}) => {
  // which style do we *show*?
  // in manual mode, show manualStyle if set
  // in auto mode, show effectiveStyle (chosen by fingerprint)
  const activeStyleId: StyleId = 
    mode === "manual" && manualStyle ? manualStyle : effectiveStyle;

  const activeStyle = STYLES[activeStyleId];
  const labelText = activeStyle ? activeStyle.label : activeStyleId;

  const handleStep = (direction: 1 | -1) => {
    const base = activeStyleId ?? STYLE_IDS[0];
    const nextId = getNextStyleId(base, direction);

    // stepping styles implies manual mode
    onModeChange("manual");
    onStyleChange(nextId);
  }

  const rootClass =
    "mini-hud" +
    (isAnimating ? " mini-hud--animating" : "") +
    (isAudioEnabled ? " mini-hud--audio-on" : "");

  return (
    <div className={rootClass}>
      {/* Prev button */}
      <button 
        type="button"
        className="mini-hud__button mini-hud__button--arrow"
        aria-label={`Previous style. Current style is ${labelText}`}
        onClick={() => handleStep(-1)}
      >
        &lt;
      </button>

      {/* Label / animation toggle */}
      <button 
        type="button"
        className="mini-hud__label"
        aria-pressed={isAnimating}
        aria-label={
          isAnimating
            ? `Stop complexity animation for ${labelText}`
            : `Start complexity animation for ${labelText}`
        }
        onClick={onToggleAnimation}
        title={
          isAnimating
            ? "Click to stop animation"
            : "Click to start animation"
        }
      >
        <span className="mini-hud__dot" />
        <span className="mini-hud__text">{labelText}</span>
      </button>

      <button
        type="button"
        className="mini-hud__button mini-hud__button--sound"
        aria-pressed={isAudioEnabled}
        aria-label={
          isAudioEnabled
            ? `Stop sound for ${labelText}`
            : `Start sound for ${labelText}`
        }
        onClick={() => {
          void onToggleAudio();
        }}
        title={isAudioEnabled ? "Stop sound" : "Start sound"}
      >
        Sound
      </button>

      {/* Next button */}
      <button 
        type="button"
        className="mini-hud__button mini-hud__button--arrow"
        aria-label={`Next style. Current style is ${labelText}`}
        onClick={() => handleStep(1)}
      >
        &gt;
      </button>
    </div>
  );
}

export default MiniHud;
