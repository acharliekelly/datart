import React, { useState, type ChangeEvent } from "react";
import type { Mode, StyleId } from "../../logic/types";
import "./ControlPanel.css";

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
  onToggleAnimation
}) => {
  const [open, setOpen] = useState(true);

  const dialValue = manualSeed ?? 50; // 0–100 dial

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

  const complexityValue = complexity;

  const handleComplexityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!Number.isNaN(value)) {
      onComplexityChange(value);
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

    // Explicitly narrow to StyleId without casts
    if (
      value === "orbits" ||
      value === "strata" ||
      value === "constellation" ||
      value === "bubbles" ||
      value === "waves" ||
      value === "supershape" ||
      value === "isogrid" ||
      value === "crystal" ||
      value === "lattice" ||
      value === "nebula" ||
      value === "aurora" ||
      value === "voronoi" ||
      value === "fern"
    ) {
      onStyleChange(value);
    } else {
      // Unknown value (shouldn't happen with our options)
      onStyleChange(null);
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

          {/* Mode */}
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
                  <option value="orbits">Orbits</option>
                  <option value="strata">Strata</option>
                  <option value="constellation">Constellation</option>
                  <option value="bubbles">Bubbles</option>
                  <option value="waves">Waves</option>
                  <option value="supershape">Supershape Stars</option>
                  <option value="isogrid">IsoGrid</option>
                  <option value="crystal">Crystal</option>
                  <option value="lattice">Lattice</option>
                  <option value="nebula">Nebula</option>
                  <option value="aurora">Aurora</option>
                  <option value="voronoi">Voronoi Bloom</option>
                  <option value="fern">Fractal Fern</option>
                </select>
              </div>
              <div className="control-hint">
                Leave as "auto" to use continent / timezone rules.
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
              <span className="control-label">Animation</span>
              <div className="control-value">
                <label className="control-radio">
                  <input
                    type="checkbox"
                    checked={isAnimating}
                    onChange={onToggleAnimation}
                  />
                  <span>Animate complexity (0 &gt; 100 &gt; 0)</span>
                </label>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ControlPanel;