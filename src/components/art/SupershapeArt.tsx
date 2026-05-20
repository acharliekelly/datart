import React, { useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";

// --- Superformula ---
// r(θ) = [ |cos(mθ/4)/a|^n2 + |sin(mθ/4)/b|^n3 ]^(-1/n1)
function supershape(theta: number, m: number, n1: number, n2: number, n3: number): number {
  const t1 = Math.abs(Math.cos((m * theta) / 4));
  const t2 = Math.abs(Math.sin((m * theta) / 4));
  const a = 1;
  const b = 1;

  const part1 = Math.pow(t1 / a, n2);
  const part2 = Math.pow(t2 / b, n3);

  const r = Math.pow(part1 + part2, -1 / n1);
  return r;
}

const SupershapeArt: React.FC<ArtStyleProps> = ({ seed, palette, complexity }) => {
  const { pathData, stroke, fillA, fillB, fillC } = useMemo(() => {
    const rng = makeRng(seed + 606);
    const plex = clamp(complexity / 100);

    // Supershape params
    // "m" controls lobes / symmetry
    const mMin = 3;
    const mMax = 12;
    const m = Math.round(lerp(mMin, mMax, Math.pow(plex, 0.7)));

    // n1, n2, n3 control roundness vs spikiness
    const n1 = lerp(0.3, 2.2, plex);
    const n2 = lerp(0.3, 1.8, Math.pow(plex, 1.5));
    const n3 = lerp(0.3, 1.8, Math.pow(plex, 1.5));

    // scale
    const radius = lerp(120, 240, 1 - plex);  // bigger at low complexity

    const steps = 360;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const r = supershape(theta, m, n1, n2, n3);
      const x = radius * r * Math.cos(theta);
      const y = radius * r * Math.sin(theta);
      points.push({ x, y });
    }

    // convert to SVG path
    const pathData = "M" + points
      .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" L ") + " Z";

    // palette selection
    const stroke = palette[Math.floor(rng() * palette.length)];
    const fillA = palette[Math.floor(rng() * palette.length)] || "#22d3ee";
    const fillB = palette[Math.floor(rng() * palette.length)] || "#a855f7";
    const fillC = palette[Math.floor(rng() * palette.length)] || "#facc15";

    return { pathData, stroke, fillA, fillB, fillC };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 0 20px rgba(0,0,0,0.4))",
      }}
    >
      <svg 
        width="90vw"
        height="90vh"
        viewBox="-260 -260 520 520"
        style={{
          overflow: "visible",
        }}
      >
        <defs>
          <radialGradient id="supershape-fill" cx="42%" cy="35%" r="70%">
            <stop offset="0%" stopColor={fillC} stopOpacity="0.95" />
            <stop offset="45%" stopColor={fillA} stopOpacity="0.88" />
            <stop offset="100%" stopColor={fillB} stopOpacity="0.72" />
          </radialGradient>
        </defs>
        <path 
          d={pathData}
          fill="url(#supershape-fill)"
          stroke={stroke}
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
          style={{
            mixBlendMode: "screen",
            filter: `drop-shadow(0 0 30px ${stroke})`,
          }}
        />
      </svg>
    </div>
  );
};

export default SupershapeArt;
