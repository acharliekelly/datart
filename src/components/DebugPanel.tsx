import React, { useState } from "react";
import type { GenerationState } from '../utils/types';
import ControlPanel from "./ControlPanel";
import './DebugPanel.css';

/* ===========================================
 *  DEBUG PANEL
 * ===========================================
 */

interface DebugPanelProps {
  state: GenerationState;
  ipLoaded: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  state,
  ipLoaded,
}) => {
  const [open, setOpen] = useState(true);
  const [manualMode, setManualMode] = useState(false);

  const short = (value: string, max = 80): string =>
    value.length > max ? value.slice(0, max) + "…" : value;

  const ip = state.traits.ipInfo;

  return (
    <div className="debug-panel">
      <button
        className="debug-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Hide debug" : "Show debug"}
      </button>

      {open && (
        <div className="debug-body">
          <h2 className="debug-title">Generation debug</h2>

          <div className="debug-section">
            <div className="debug-row">
              <span className="debug-label">Style</span>
              <span className="debug-value">{state.styleId}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Seed</span>
              <span className="debug-value">{state.seed}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">IP loaded</span>
              <span className="debug-value">
                {ipLoaded ? "yes" : "no (browser-only)"}
              </span>
            </div>
          </div>

          <div className="debug-section">
            <div className="debug-row">
              <span className="debug-label">Time zone</span>
              <span className="debug-value">
                {state.traits.timeZone}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Language</span>
              <span className="debug-value">
                {state.traits.language}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">User agent</span>
              <span className="debug-value">
                {short(state.traits.userAgent)}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Fingerprint</span>
              <span className="debug-value">
                {short(state.fingerprint)}
              </span>
            </div>
          </div>

          <div className="debug-section">
            <div className="debug-row">
              <span className="debug-label">IP</span>
              <span className="debug-value">{ip?.ip ?? "—"}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Location</span>
              <span className="debug-value">
                {ip
                  ? [ip.city, ip.region, ip.country]
                      .filter(Boolean)
                      .join(", ")
                  : "—"}
              </span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Continent</span>
              <span className="debug-value">
                {ip?.continentCode ?? "—"}
              </span>
            </div>
          </div>

          <div className="debug-section">
            <div className="debug-row">
              <span className="debug-label">Palette</span>
              <span className="debug-value debug-palette">
                {state.palette.map((color, idx) => (
                  <span
                    key={idx}
                    className="debug-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </span>
            </div>
          </div>

          <div className="debug-section">
            <div className="debug-row">
              <span className="debug-label">Mode</span>
              <span className="debug-value">
                <button
                  className="debug-toggle"
                  title={`Switch to ${manualMode ? "Auto" : "Manual"} Mode`}
                  onClick={() => setManualMode((m) => !m)}
                >
                  {manualMode ? "Manual" : "Auto"}
                </button>
              </span>
            </div>
          </div>

          {manualMode && <ControlPanel {...state} />}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;