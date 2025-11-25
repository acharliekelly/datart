import React, { useState, useRef } from "react";
import type { GenerationState, Mode } from "../../logic/types";
import { useIsDev } from "../../hooks/useIsDev";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useDraggablePanel } from "../../hooks/useDraggablePanel";
import './panel.css';
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
  isMobile?: boolean;
  hudHidden?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  state,
  ipLoaded,
  mode,
  ipError,
  hudHidden
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(rootRef, () => setOpen(false), open);

  const ip = state.traits.ipInfo;
  const isDev = useIsDev();

  const panelWidth = 360;
  const margin = 12;

  const initialX = typeof window !== "undefined"
    ? Math.max(margin, window.innerWidth - panelWidth - margin)
    : 1000; // fallback

  const { panelStyle, handleProps } = useDraggablePanel({
    initialX,
    initialY: 60,
    bounds: {
      margin,
      panelWidth,
      panelHeight: 400, // rough, for clamping
    }
  })

  const short = (value: string, max = 80): string =>
    value.length > max ? value.slice(0, max) + "…" : value;

  const toggleLabel = open ? "Hide debug" : "Show debug";
  const toggleClasses =
    "panel-toggle panel-toggle--debug" +
    (open ? "" : " panel-toggle--off") +
    (isDev ? " panel-toggle--dev" : "");
  const panelClasses = "debug-panel panel-body debug-panel--floating" +
    (open ? " debug-panel--visible" : "");

  // HUD closed
  if (hudHidden) return null;

  return (
    <div ref={rootRef}>
      <button
        className={toggleClasses}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="panel-toggle__dot" />
        <span>{toggleLabel}</span>
      </button>

      {open && (
        <div 
          className={panelClasses}
          style={panelStyle}
        >
          <div className="panel-header drag-handle" {...handleProps}>
            <h2 className="panel-title">Generation Debug</h2>
          </div>

          <div className="panel-section">
            <div className="panel-row">
              <span className="panel-label">Mode</span>
              <span className="debug-value">{mode}</span>
            </div>

            <div className="panel-row">
              <span className="panel-label">Seed source</span>
              <span className="debug-value">{state.seedSource}</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Base seed</span>
              <span className="debug-value">{state.baseSeed}</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Effective seed</span>
              <span className="debug-value">{state.seed}</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Complexity</span>
              <span className="debug-value">{Math.round(state.complexity)}</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Palette shift</span>
              <span className="debug-value">
                {state.paletteShift}
              </span>
            </div>
          </div>
          <div className="panel-section">
            <div className="panel-row">
              <span className="panel-label">Style</span>
              <span className="debug-value">{state.styleId}</span>
            </div>
            {state.styleReason && (
              <div className="panel-row">
                <span className="panel-label">Style reason</span>
                <span className="debug-value">
                  {state.styleReason}
                </span>
              </div>
            )}
            <div className="panel-row">
              <span className="panel-label">IP loaded</span>
              <span className="debug-value">
                {ipLoaded ? "yes" : "no"}
              </span>
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-row">
              <span className="panel-label">Time zone</span>
              <span className="debug-value">
                {state.traits.timeZone}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Language</span>
              <span className="debug-value">
                {state.traits.language}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">User agent</span>
              <span className="debug-value">
                {short(state.traits.userAgent)}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Fingerprint</span>
              <div className="debug-value">
                {short(state.fingerprint)}
              </div>
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-row">
              <span className="panel-label">IP</span>
              <span className="debug-value">{ip?.ip ?? "—"}</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Location</span>
              <span className="debug-value">
                {ip
                  ? [ip.city, ip.region, ip.country]
                      .filter(Boolean)
                      .join(", ")
                  : "—"}
              </span>
            </div>
            <div className="panel-row">
              <span className="panel-label">Continent</span>
              <span className="debug-value">
                {ip?.continentCode ?? "—"}
              </span>
            </div>
          </div>

          {ipError && (
            <div className="panel-section">
              <div className="panel-row">
                <span className="panel-label">IP Error</span>
                <span className="debug-value">{ipError}</span>
              </div>
            </div>
          )}

          {/* Palette */}
          <div className="panel-section">
            <div className="panel-row">
              <span className="panel-label">Palette</span>
              <span className="panel-value debug-palette">
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
          <div className="panel-section">
            <div className="panel-row">
                <span className="panel-label">Explain this Art</span>
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