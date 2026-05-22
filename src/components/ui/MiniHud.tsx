import React, { useRef } from "react";
import type { Mode, StyleId } from "../../logic/types";
import { STYLES } from "../art/styleRegistry";
import "./MiniHud.css";

interface MiniHudProps {
  mode: Mode;
  manualStyle: StyleId | null;
  effectiveStyle: StyleId;
  isAnimating: boolean;
  isAudioEnabled: boolean;
  audioModeLabel: string;
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
  audioModeLabel,
  onModeChange,
  onStyleChange,
  onToggleAnimation,
  onToggleAudio,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return;

    handleStep(dx < 0 ? 1 : -1);
  };

  const rootClass =
    "mini-hud" +
    (isAnimating ? " mini-hud--animating" : "") +
    (isAudioEnabled ? " mini-hud--audio-on" : "");

  return (
    <div
      className={rootClass}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Prev button */}
      <button 
        type="button"
        className="mini-hud__button mini-hud__button--arrow"
        aria-label={`Previous style. Current style is ${labelText}`}
        onClick={() => handleStep(-1)}
      >
        &lt;
      </button>

      <div
        className="mini-hud__label"
      >
        <span className="mini-hud__text">{labelText}</span>
      </div>

      <button
        type="button"
        className="mini-hud__button mini-hud__button--motion"
        aria-pressed={isAnimating}
        aria-label={
          isAnimating
            ? `Stop automatic complexity for ${labelText}. Visual motion and audio variation will become static.`
            : `Start automatic complexity for ${labelText}. Visual motion and audio variation will change together.`
        }
        onClick={onToggleAnimation}
        title={
          isAnimating
            ? "Stop automatic complexity"
            : "Start automatic complexity"
        }
      >
        <span className="mini-hud__motion-dot" />
        <span className="mini-hud__text">Motion</span>
      </button>

      <button
        type="button"
        className="mini-hud__button mini-hud__button--sound"
        aria-pressed={isAudioEnabled}
        aria-label={
          isAudioEnabled
            ? `Stop ${audioModeLabel} sound for ${labelText}`
            : `Start ${audioModeLabel} sound for ${labelText}`
        }
        onClick={() => {
          void onToggleAudio();
        }}
        title={isAudioEnabled ? "Stop sound" : "Start sound"}
      >
        <span className="mini-hud__sound-dot" />
        <span className="mini-hud__text">{audioModeLabel}</span>
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
