import React, { useEffect, useState, useRef, type ChangeEvent } from "react";
import type { Mode, StyleId } from "../../logic/types";
import { useIsDev } from "../../hooks/useIsDev";
import { useClickOutside } from "../../hooks/useClickOutside";
import { STYLES } from "../art/styleRegistry";

import "./ControlPanel.css";
import "./panel.css";

const STYLE_OPTIONS = [
  { id: null as StyleId | null, label: "auto" },
  ...Object.values(STYLES).map((s) => ({
    id: s.id as StyleId,
    label: s.label,
  })),
];

interface ControlPanelProps {
  mode: Mode;
  manualSeed: number | null;
  manualStyle: StyleId | null;
  complexity: number;
  onModeChange: (mode: Mode) => void;
  onSeedChange: (seed: number | null) => void;
  onStyleChange: (style: StyleId | null) => void;
  onComplexityChange: (value: number) => void;
  onShufflePalette: () => void;
  isAnimating: boolean;
  onToggleAnimation: () => void;
  isAudioEnabled: boolean;
  audioVolume: number;
  audioSummary: string;
  audioError: string | null;
  onToggleAudio: () => void | Promise<void>;
  onAudioVolumeChange: (volume: number) => void;
  isMobile?: boolean;
  hudHidden?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  manualSeed,
  manualStyle,
  complexity,
  onModeChange,
  onSeedChange,
  onStyleChange,
  onComplexityChange,
  onShufflePalette,
  isAnimating,
  onToggleAnimation,
  isAudioEnabled,
  audioVolume,
  audioSummary,
  audioError,
  onToggleAudio,
  onAudioVolumeChange,
  isMobile = false,
  hudHidden
}) => {
  const [open, setOpen] = useState(false);
  const isDev = useIsDev();

  const rootRef = useRef<HTMLDivElement | null>(null);
  // close when clicking outside toggle+panel
  useClickOutside(rootRef, () => setOpen(false), open && !isMobile);

  const dialValue = manualSeed ?? 50; // 0–100 dial
  const complexityValue = complexity;
  const controlsPanelId = isMobile
    ? "datart-controls-panel-mobile"
    : "datart-controls-panel";
  const roundedAudioVolume = Math.round(audioVolume * 100);

  useEffect(() => {
    if (!open) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleSeedChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      onSeedChange(null);
      return;
    }
    onSeedChange(value);
  };

  const handleComplexityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!Number.isNaN(value)) {
      onComplexityChange(value);
    }
  };

  const handleAudioVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!Number.isNaN(value)) {
      onAudioVolumeChange(value / 100);
    }
  };

  const handleRandomize = () => {
    const randomDial = Math.floor(Math.random() * 101); // 0–100
    onSeedChange(randomDial);
    if (mode !== "manual") {
      onModeChange("manual");
    }
  };

  const handleStyleChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    if (value === "") {
      onStyleChange(null);
      return;
    }
    // TODO: validate style
    onStyleChange(value);
  }

  const toggleLabel = open ? "Hide controls" : "Show controls";
  const toggleClasses = 
    "panel-toggle panel-toggle--controls" +
    (open ? "" : " panel-toggle--off") +
    (isDev ? " panel-toggle--dev" : "");
  const panelCls =
    "control-panel" +
    (isDev ? " dev-mode" : "") +
    (open ? " control-panel--visible" : "") +
    (isMobile ? "" : " control-panel--desktop");

  if (hudHidden) {
    return null;
  }

  if (isMobile) {
    return (
      <div ref={rootRef}>
        {/* floating toggle */}
        <button 
          className={toggleClasses} 
          type="button"
          aria-expanded={open}
          aria-controls={controlsPanelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="panel-toggle__dot" />
          <span>{toggleLabel}</span>
        </button>

        {open && (
        <div
          id={controlsPanelId}
          className="control-panel panel-body panel-floating control-panel--mobile control-panel--visible"
          role="dialog"
          aria-label="DatArt controls"
        >
          <div className="control-header">
            <span className="control-title">Controls</span>
          </div>
          <div className="control-section">
            <div className="control-row">
              <span className="control-label">Mode</span>
              <div className="control-value">
                <label className="control-radio">
                  <input
                    type="radio"
                    name="mode"
                    value="auto"
                    checked={mode === "auto"}
                    onChange={() => onModeChange("auto")}
                  />
                  <span>Auto</span>
                </label>
                <label className="control-radio">
                  <input
                    type="radio"
                    name="mode"
                    value="manual"
                    checked={mode === "manual"}
                    onChange={() => onModeChange("manual")}
                  />
                  <span>Manual</span>
                </label>
              </div>
            </div>
          </div>

          {/* Style Gallery (mobile) */}
          <div className="control-section">
            <div className="control-row">
              <span className="control-label">Style</span>
            </div>
            <div className="style-gallery">
              {STYLE_OPTIONS.map((opt) => {
                const isSelected =
                  opt.id === null
                    ? mode === "auto" && manualStyle == null
                    : mode === "manual" && manualStyle === opt.id;

                const className = "style-chip" + (isSelected ? " style-chip--selected" : "");

                return (
                  <button
                    key={opt.id ?? "auto"}
                    className={className}
                    type="button"
                    onClick={() => {
                      if (opt.id === null) {
                        // auto style selection
                        onModeChange("auto");
                        onStyleChange(null);
                      } else {
                        onModeChange("manual");
                        onStyleChange(opt.id);
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complexity (mobile) */}
          <div className="control-section">
            <div className="control-row">
              <span className="control-label">Complexity</span>
              <div className="control-value control-seed-row">
                  <input
                    type="range"
                  min={0}
                  max={100}
                  step={1}
                    className="control-range"
                    value={complexity}
                    disabled={mode !== "manual" || isAnimating}
                    aria-label="Complexity"
                    aria-valuetext={`${Math.round(complexity)} percent complexity`}
                    onChange={(e) =>
                    onComplexityChange(Number(e.target.value))
                  }
                />
                <span className="control-range-value">
                  {Math.round(complexity)}
                </span>
              </div>
            </div>
            <div className="control-row" style={{ marginTop: "0.25rem" }}>
              <span className="control-label">Motion</span>
              <div className="control-value">
                <label className="control-radio">
                  <input
                    type="checkbox"
                    checked={isAnimating}
                    onChange={onToggleAnimation}
                  />
                  <span>Automatic complexity</span>
                </label>
              </div>
              <div className="control-hint">
                Changes visual complexity and sound variation together.
              </div>
            </div>
          </div>

          <div className="control-section">
            <div className="control-row">
              <span className="control-label">Sound</span>
              <div className="control-value control-seed-row">
                <button
                  type="button"
                  className="control-button"
                  aria-pressed={isAudioEnabled}
                  onClick={() => {
                    void onToggleAudio();
                  }}
                >
                  {isAudioEnabled ? "Stop sound" : "Start sound"}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  className="control-range"
                  value={roundedAudioVolume}
                  onChange={handleAudioVolumeChange}
                  aria-label="Sound volume"
                  aria-valuetext={`${roundedAudioVolume} percent volume`}
                />
                <span className="control-range-value">
                  {roundedAudioVolume}
                </span>
              </div>
              <div className="control-hint">{audioSummary}</div>
              {audioError && (
                <div className="control-hint control-hint--error">
                  {audioError}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
  )}
    

  // Desktop version
  return (
    <div ref={rootRef}>
      <button
        className={toggleClasses}
        type="button"
        aria-expanded={open}
        aria-controls={controlsPanelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="panel-toggle__dot" />
        <span>{toggleLabel}</span>
      </button>

      {open && (
        <div
          id={controlsPanelId}
          className={panelCls}
          role="dialog"
          aria-label="DatArt controls"
        >
          <div className="control-body">
            <div className="panel-header">
              <h2 className="panel-title">Controls</h2>
            </div>
          
            <div className="control-panel__content">
            {/* Mode */}
              <div className="panel-section">
                <div className="control-row">
                  <span className="control-label">Mode</span>
                  <div className="control-value">
                    <label className="control-radio">
                      <input
                        type="radio"
                        name="mode"
                        value="auto"
                        checked={mode === "auto"}
                        onChange={() => onModeChange("auto")}
                      />
                      <span>Auto (fingerprint)</span>
                    </label>
                    <label className="control-radio">
                      <input
                        type="radio"
                        name="mode"
                        value="manual"
                        checked={mode === "manual"}
                        onChange={() => onModeChange("manual")}
                      />
                      <span>Manual</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Style selector */}
              <div className="control-section">
                <div className="control-row">
                  <span className="control-label">Style</span>
                  <div className="control-value">
                    <select
                      className="control-select"
                      value={manualStyle ?? ""}
                      onChange={handleStyleChange}
                      disabled={mode !== "manual"}
                    >
                      <option value="">auto</option>
                      {STYLE_OPTIONS.map((opt) => {
                        return (
                          <option key={opt.id} value={opt.id ?? ""}>{opt.label}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="control-hint">
                    Leave as "auto" to use weighted fingerprint selection.
                  </div>
                </div>
              </div>


              {/* Seed dial */}
              <div className="control-section">
                <div className="control-row">
                  <span className="control-label">Seed</span>
                  <div className="control-value control-seed-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="control-range"
                      value={dialValue}
                      onChange={handleSeedChange}
                      disabled={mode !== "manual"}
                      aria-label="Manual seed"
                      aria-valuetext={`${dialValue} seed value`}
                    />
                    <span className="control-range-value">
                      {dialValue}
                    </span>
                    <button
                      className="control-button"
                      onClick={handleRandomize}
                    >
                      Random
                    </button>
                  </div>
                  <div className="control-hint">
                    In manual mode, this dial perturbs the fingerprint to
                    create a new variation.
                  </div>
                </div>
              </div>

              {/* Complexity dial */}
              <div className="control-section">
                <div className="control-row">
                  <span className="control-label">Complexity</span>
                  <div className="control-value control-seed-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="control-range"
                      value={complexityValue}
                      onChange={handleComplexityChange}
                      disabled={mode !== "manual" || isAnimating}
                      aria-label="Complexity"
                      aria-valuetext={`${Math.round(complexityValue)} percent complexity`}
                    />
                    <span className="control-range-value">
                      {Math.round(complexityValue)}
                    </span>
                    <button
                      className="control-button"
                      onClick={onShufflePalette}
                    >
                      Shuffle Palette
                    </button>
                  </div>
                  <div className="control-hint">
                    Higher complexity &gt; more shapes. Shuffle to keep structure but change colors.
                  </div>
                </div>

                <div className="control-row" style={{ marginTop: "0.3rem" }}>
                  <span className="control-label">Motion</span>
                  <div className="control-value">
                    <label className="control-radio">
                      <input
                        type="checkbox"
                        checked={isAnimating}
                        onChange={onToggleAnimation}
                      />
                      <span>Automatic complexity</span>
                    </label>
                  </div>
                  <div className="control-hint">
                    Changes visual complexity and sound variation together.
                  </div>
                </div>
              </div>

              <div className="control-section">
                <div className="control-row">
                  <span className="control-label">Sound</span>
                  <div className="control-value control-seed-row">
                    <button
                      type="button"
                      className="control-button"
                      aria-pressed={isAudioEnabled}
                      onClick={() => {
                        void onToggleAudio();
                      }}
                    >
                      {isAudioEnabled ? "Stop sound" : "Start sound"}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="control-range"
                      value={roundedAudioVolume}
                      onChange={handleAudioVolumeChange}
                      aria-label="Sound volume"
                      aria-valuetext={`${roundedAudioVolume} percent volume`}
                    />
                    <span className="control-range-value">
                      {roundedAudioVolume}
                    </span>
                  </div>
                  <div className="control-hint">{audioSummary}</div>
                  {audioError && (
                    <div className="control-hint control-hint--error">
                      {audioError}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
