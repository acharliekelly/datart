import React, { useEffect, useState, useRef } from "react";
import type { GenerationState, Mode } from "../../logic/types";
import { useIsDev } from "../../hooks/useIsDev";
import { useClickOutside } from "../../hooks/useClickOutside";
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
  isMobile = false,
  hudHidden
}) => {
  const [open, setOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(rootRef, () => setOpen(false), open);

  const ip = state.traits.ipInfo;
  const isDev = useIsDev();

  const short = (value: string, max = 80): string =>
    value.length > max ? value.slice(0, max) + "…" : value;
  const browserName = getBrowserName(state.traits.userAgent);

  const toggleLabel = open ? "Hide explanation" : "Show explanation";
  const toggleClasses =
    "panel-toggle panel-toggle--debug" +
    (open ? "" : " panel-toggle--off") +
    (isDev ? " panel-toggle--dev" : "");
  const panelClasses =
    "debug-panel panel-body debug-panel--floating" +
    (open ? " debug-panel--visible" : "") +
    (isMobile ? " debug-panel--mobile" : "");

  const debugPanelId = "datart-debug-panel";
  const debugDetailsId = "datart-debug-details";

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

  // HUD closed
  if (hudHidden) return null;

  return (
    <div ref={rootRef}>
      <button
        className={toggleClasses}
        type="button"
        aria-expanded={open}
        aria-controls={debugPanelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="panel-toggle__dot" />
        <span>{toggleLabel}</span>
      </button>

      {open && (
        <div 
          id={debugPanelId}
          className={panelClasses}
          role="dialog"
          aria-label="Art explanation"
        >
          <div className="panel-header">
            <h2 className="panel-title">Explain Art</h2>
          </div>

          <div className="explain-panel__intro">
            <p>
              DatArt turns browser and location traits into a deterministic
              fingerprint. That fingerprint becomes the seed for this visual
              style, palette, complexity, and sound profile.
            </p>
            <p>
              This version selected <strong>{state.styleId}</strong> at
              complexity <strong>{Math.round(state.complexity)}</strong>.
              {state.styleReason ? ` ${state.styleReason}` : ""}
            </p>
          </div>

          <div className="panel-section explain-panel__traits">
            <h3 className="debug-section-title">Fingerprint components</h3>
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
                {browserName}
              </span>
            </div>
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

          <div className="panel-section">
            <button
              type="button"
              className="debug-details-toggle"
              aria-expanded={debugOpen}
              aria-controls={debugDetailsId}
              onClick={() => setDebugOpen((value) => !value)}
            >
              {debugOpen ? "Hide debug details" : "Show debug details"}
            </button>

            {debugOpen && (
              <div id={debugDetailsId} className="debug-details">
                <h3 className="debug-section-title">Debug details</h3>
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
                  <span className="panel-label">Palette shift</span>
                  <span className="debug-value">
                    {state.paletteShift}
                  </span>
                </div>
                <div className="panel-row">
                  <span className="panel-label">IP loaded</span>
                  <span className="debug-value">
                    {ipLoaded ? "yes" : "no"}
                  </span>
                </div>
                <div className="panel-row">
                  <span className="panel-label">Fingerprint</span>
                  <div className="debug-value">
                    {short(state.fingerprint, 120)}
                  </div>
                </div>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;

function getBrowserName(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("chrome/")) return "Chrome";
  if (ua.includes("safari/")) return "Safari";
  return "Unknown browser";
}
