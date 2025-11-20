import React, { useState } from "react";
import type { Mode, StyleId } from '../utils/types';
import "./ControlPanel.css";

interface ControlPanelProps {
  mode: Mode;
  manualSeed: number | null;
  manualStyle: StyleId | null;
  onModeChange: (mode: Mode) => void;
  onSeedChange: (seed: number | null) => void;
  onStyleChange: (style: StyleId | null) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  mode,
  manualSeed,
  manualStyle,
  onModeChange,
  onSeedChange,
  onStyleChange,
 }) => {

  const [open, setOpen] = useState(true);

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
                </select>
              </div>
              <div className="control-hint">
                Leave as "auto" to use continent / timezone rules.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;