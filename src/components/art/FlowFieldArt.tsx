import React, { useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";

interface FlowPoint {
  x: number;
  y: number;
}

interface FlowPath {
  id: number;
  points: FlowPoint[];
  stroke: string;
  opacity: number;
  width: number;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Simple deterministic "noise-ish" angle field
function flowAngle(x: number, y: number, seedPhase: number): number {
  const nx = x / 100;
  const ny = y / 100;

  const a =
    Math.sin((nx * 4.0 + seedPhase) * Math.PI * 2) * 0.8 +
    Math.cos((ny * 3.0 - seedPhase) * Math.PI * 2) * 0.6 +
    Math.sin((nx + ny * 0.7 + seedPhase * 0.5) * Math.PI * 2) * 0.4;

  return a * Math.PI; // roughly -π..π
}

const FlowFieldArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { paths, background } = useMemo(() => {
    const rng = makeRng(seed + 9898);
    const t = clamp01(complexity / 100);

    // number of paths
    const minPaths = 60;
    const maxPaths = 260;
    const pathCount = Math.round(
      lerp(minPaths, maxPaths, Math.pow(t, 0.9))
    );

    // steps per path
    const minSteps = 18;
    const maxSteps = 70;
    const steps = Math.round(lerp(minSteps, maxSteps, Math.pow(t, 1.0)));

    // step length
    const stepLen = lerp(0.4, 1.4, 1 - t); // smaller steps at high complexity

    // wiggle the flowfield a bit with seed
    const seedPhase = (seed % 1000) / 997;

    const paths: FlowPath[] = [];

    for (let i = 0; i < pathCount; i++) {
      // start positions scattered with a bias toward center
      const rx = rng();
      const ry = rng();
      const x0 = 50 + (rx - 0.5) * 80; // 10–90
      const y0 = 50 + (ry - 0.5) * 80;

      let x = x0;
      let y = y0;

      const pts: FlowPoint[] = [];
      pts.push({ x, y });

      // color per path, not per point
      const color =
        palette[Math.floor(rng() * palette.length)] || "#22d3ee";

      const width = lerp(0.18, 0.65, 1 - t) * (0.8 + rng() * 0.4);
      const opacity =
        lerp(0.3, 0.8, t) * (0.7 + rng() * 0.4);

      for (let s = 0; s < steps; s++) {
        const angle = flowAngle(x, y, seedPhase);

        const jitter = (rng() - 0.5) * 0.2; // small additional chaos
        const a = angle + jitter;

        x += Math.cos(a) * stepLen;
        y += Math.sin(a) * stepLen;

        // bail out if we wander too far offscreen
        if (x < 0 || x > 100 || y < 0 || y > 100) break;

        pts.push({ x, y });
      }

      if (pts.length > 1) {
        paths.push({
          id: i,
          points: pts,
          stroke: color,
          opacity,
          width,
        });
      }
    }

    const background =
      "radial-gradient(circle at 50% 110%, rgba(15,23,42,1), #020617 70%)";

    return { paths, background };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{ backgroundImage: background }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          mixBlendMode: "screen",
        }}
      >
        {paths.map((p) => (
          <polyline
            key={p.id}
            points={p.points
              .map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
              .join(" ")}
            fill="none"
            stroke={p.stroke}
            strokeWidth={p.width}
            strokeOpacity={p.opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
};

export default FlowFieldArt;
