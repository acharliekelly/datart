import React, { useState } from "react";
import type { GenerationState, Mode } from "../../logic/types";
import './DebugPanel.css';

/* ===========================================
 *  DEBUG PANEL
 * ===========================================
 */

interface DebugPanelProps {
  state: GenerationState;
  ipLoaded: boolean;
  mode: Mode;
  ipError?: string | null;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  state,
  ipLoaded,
  mode,
  ipError
}) => {
  const [open, setOpen] = useState(true);
  const ip = state.traits.ipInfo;

  const short = (value: string, max = 80): string =>
    value.length > max ? value.slice(0, max) + "…" : value;

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
              <span className="debug-label">Mode</span>
              <span className="debug-value">{mode}</span>
            </div>

            <div className="debug-row">
              <span className="debug-label">Seed source</span>
              <span className="debug-value">{state.seedSource}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Base seed</span>
              <span className="debug-value">{state.baseSeed}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Effective seed</span>
              <span className="debug-value">{state.seed}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Complexity</span>
              <span className="debug-value">{Math.round(state.complexity)}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Palette shift</span>
              <span className="debug-value">
                {state.paletteShift}
              </span>
            </div>
          </div>
          <div className="debug-section">
            <div className="debug-row">
              <span className="debug-label">Style</span>
              <span className="debug-value">{state.styleId}</span>
            </div>
            {state.styleReason && (
              <div className="debug-row">
                <span className="debug-label">Style reason</span>
                <span className="debug-value">
                  {state.styleReason}
                </span>
              </div>
            )}
            <div className="debug-row">
              <span className="debug-label">IP loaded</span>
              <span className="debug-value">
                {ipLoaded ? "yes" : "no"}
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
              <div className="debug-value">
                {short(state.fingerprint)}
              </div>
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

          {ipError && (
            <div className="debug-section">
              <div className="debug-row">
                <span className="debug-label">IP Error</span>
                <span className="debug-value">{ipError}</span>
              </div>
            </div>
          )}

          {/* Palette */}
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

          {/* Explanation section */}
          <div className="debug-section">
            <div className="debug-row">
                <span className="debug-label">Explain this Art</span>
                <span className="debug-value"></span>
            </div>
            <ul className="debug-list">
              <li className="debug-list-item">
                <strong>Fingerprint &gt; base seed:</strong>{" "}
                We hash your browser/IP traits into a fingerprint, then into{" "}
                <code>{state.baseSeed}</code>.
              </li>

              <li className="debug-list-item">
                <strong>Effective seed:</strong>{" "}
                {state.seedSource === "manualDial" ? (
                  <>
                    Manual mode is on; seed dial <code>{state.seedDial}</code>{" "}
                    perturbs the fingerprint to produce{" "}
                    <code>{state.seed}</code>.
                  </>
                ) : (
                  <>
                    Auto mode uses the base seed directly as{" "}
                    <code>{state.seed}</code>.
                  </>
                )}
              </li>

              <li className="debug-list-item">
                <strong>Style:</strong>{" "}
                <code>{state.styleId}</code>
                {state.styleReason ? (
                  <>
                    {" "}
                    &gt; {state.styleReason}
                  </>
                ) : null}
              </li>

              <li className="debug-list-item">
                <strong>Complexity:</strong>{" "}
                <code>{Math.round(state.complexity)}</code>{" "}
                (higher = more rings / bands / stars, depending on style)
              </li>

              <li className="debug-list-item">
                <strong>Palette:</strong>{" "}
                base palette from the seed, rotated by{" "}
                <code>{state.paletteShift}</code> step 
                {state.paletteShift === 1 ? "" : "s"}.
              </li>
            </ul>

          </div>  
        </div>
      )}
    </div>
  );
};

export default DebugPanel;