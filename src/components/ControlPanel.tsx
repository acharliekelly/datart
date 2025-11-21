import React, { useState } from "react";
import type { AllStyleOptions, Mode, StyleId } from '../utils/types';
import "./ControlPanel.css";

interface ControlPanelProps {
  mode: Mode;
  manualSeed: number | null;
  manualStyle: StyleId | null;
  effectiveStyleId: StyleId;
  styleOptions: AllStyleOptions;
  onModeChange: (mode: Mode) => void;
  onSeedChange: (seed: number | null) => void;
  onStyleChange: (style: StyleId | null) => void;
  onStyleOptionsChange: (next: AllStyleOptions) => void; 
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  mode,
  manualSeed,
  manualStyle,
  effectiveStyleId,
  styleOptions,
  onModeChange,
  onSeedChange,
  onStyleChange,
  onStyleOptionsChange
 }) => {

  const [open, setOpen] = useState(true);

  const activeStyleId = effectiveStyleId;
  const opts = styleOptions[activeStyleId];

  const updateOptions = (partial: Partial<AllStyleOptions[StyleId]>) => {
    onStyleOptionsChange({
      ...styleOptions,
      [activeStyleId]: {
        ...(styleOptions as any)[activeStyleId],
        ...partial,
      },
    });
  };

  const handleSeedInput = (value: string) => {
    if (value.trim() === "") {
      onSeedChange(null);
      return;
    }
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      onSeedChange(parsed);
    }
  };

  const handleRandomize = () => {
    const randomSeed = Math.floor(Math.random() * 1_000_000);
    onSeedChange(randomSeed);
    // also ensure we're in manual mode if user hits random
    if (mode !== "manual") {
      onModeChange("manual");
    }
  };

  return (
      <div className="control-panel">
      <button
        className="control-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Hide controls" : "Show controls"}
      </button>

      {open && (
        <div className="control-body">
          <h2 className="control-title">Controls</h2>

          {/* Mode selection */}
          <div className="control-section">
            <div className="control-row">
              <span className="control-label">
                {`Style options (${activeStyleId})`}
              </span>

              {mode !== "manual" && (
                <div className="control-hint">
                  Switch to manual mode to tweak style options.
                </div>
              )}
            </div>
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

          {/* Seed */}
          <div className="control-section">
            <div className="control-row">
              <span className="control-label">Seed</span>
              <div className="control-value control-seed-row">
                <input
                  type="number"
                  className="control-input"
                  value={manualSeed ?? ""}
                  onChange={(e) => handleSeedInput(e.target.value)}
                  disabled={mode !== "manual"}
                  placeholder="auto"
                />
                <button
                  className="control-button"
                  onClick={handleRandomize}
                >
                  Random
                </button>
              </div>
              <div className="control-hint">
                In manual mode, seed overrides the fingerprint hash.
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="control-section">
            <div className="control-row">
              <span className="control-label">Style</span>
              <div className="control-value">
                <select
                  className="control-select"
                  value={manualStyle ?? ""}
                  onChange={(e) =>
                    onStyleChange(
                      e.target.value
                        ? (e.target.value as StyleId) 
                        : null
                    )
                  }
                  disabled={mode !== "manual"}
                >
                  <option value="">auto</option>
                  <option value="orbits">Orbits</option>
                  <option value="strata">Strata</option>
                  <option value="constellation">Constellation</option>
                  <option value="bubbles">Bubbles</option>
                </select>
              </div>
              <div className="control-hint">
                Leave as "auto" to use continent / timezone rules.
              </div>
            </div>
          </div>

          {/* style-specific controls */}

          {/* Orbits */}
          {mode === "manual" && activeStyleId === "orbits" && (
            <>
              <div className="control-row">
                <span className="control-label">Ring count</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="control-input"
                    min={3}
                    max={40}
                    value={(opts as any).ringCount ?? 14}
                    onChange={(e) =>
                      updateOptions({
                        ringCount: Number(e.target.value) || 14,
                      } as any)
                    }
                  />
                </div>
              </div>
              <div className="control-row">
                <span className="control-label">Jitter (px)</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="control-input"
                    min={0}
                    max={200}
                    value={(opts as any).jitter ?? 80}
                    onChange={(e) =>
                      updateOptions({
                        jitter: Number(e.target.value) || 80,
                      } as any)
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Constellation */}
          {mode === "manual" && activeStyleId === "constellation" && (
            <>
              <div className="control-row">
                <span className="control-label">Point count</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="control-input"
                    min={5}
                    max={80}
                    value={(opts as any).pointCount ?? 24}
                    onChange={(e) =>
                      updateOptions({
                        pointCount: Number(e.target.value) || 24,
                      } as any)
                    }
                  />
                </div>
              </div>
              <div className="control-row">
                <span className="control-label">
                  Connection chance (0–1)
                </span>
                <div className="control-value">
                  <input
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    className="control-input"
                    value={(opts as any).connectionChance ?? 0.6}
                    onChange={(e) =>
                      updateOptions({
                        connectionChance: Math.min(
                          1,
                          Math.max(0, Number(e.target.value) || 0.6)
                        ),
                      } as any)
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Bubbles */}
          {mode === "manual" && activeStyleId === "bubbles" && (
            <>
              <>
              <div className="control-row">
                <span className="control-label">Bubble count</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="control-input"
                    min={3}
                    max={40}
                    value={(opts as any).bubbleCount ?? 26}
                    onChange={(e) =>
                      updateOptions({
                        bubbleCount: Number(e.target.value) || 26,
                      } as any)
                    }
                  />
                </div>
              </div>
              <div className="control-row">
                <span className="control-label">Spread (px)</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="control-input"
                    min={10}
                    max={300}
                    value={(opts as any).spread ?? 220}
                    onChange={(e) =>
                      updateOptions({
                        spread: Number(e.target.value) || 220,
                      } as any)
                    }
                  />
                </div>
              </div>
            </>
            </>
          )}

          {/* Strata */}
          {mode === "manual" && activeStyleId === "strata" && (
            <>
              <>
              <div className="control-row">
                <span className="control-label">Band count</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="control-input"
                    min={3}
                    max={40}
                    value={(opts as any).bandCount ?? 16}
                    onChange={(e) =>
                      updateOptions({
                        bandCount: Number(e.target.value) || 16,
                      } as any)
                    }
                  />
                </div>
              </div>
              <div className="control-row">
                <span className="control-label">Maximum Tilt (degrees)</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="control-input"
                    min={2}
                    max={30}
                    value={(opts as any).maxTilt ?? 8}
                    onChange={(e) =>
                      updateOptions({
                        maxTilt: Number(e.target.value) || 8,
                      } as any)
                    }
                  />
                </div>
              </div>
            </>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default ControlPanel;