import React, { useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";

interface FernPoint {
  id: number;
  x: number; // 0–100 (svg coords)
  y: number; // 0–100
  color: string;
  opacity: number;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

// Barnsley fern affine maps
function barnsleyStep(
  x: number,
  y: number,
  r: number
): { x: number; y: number } {
  if (r < 0.01) {
    // stem
    return { x: 0, y: 0.16 * y };
  } else if (r < 0.86) {
    // successively smaller leaflets
    return {
      x: 0.85 * x + 0.04 * y,
      y: -0.04 * x + 0.85 * y + 1.6,
    };
  } else if (r < 0.93) {
    // left-hand leaflet
    return {
      x: 0.2 * x - 0.26 * y,
      y: 0.23 * x + 0.22 * y + 1.6,
    };
  } else {
    // right-hand leaflet
    return {
      x: -0.15 * x + 0.28 * y,
      y: 0.26 * x + 0.24 * y + 0.44,
    };
  }
}

/*
 * classic Barnsley fern transform set
 */
const FernArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { points, background } = useMemo(() => {
    const rng = makeRng(seed + 4242);
    const t = clamp01(complexity / 100);

    // Iterations: more detail as complexity rises
    const minIter = 2500;
    const maxIter = 14000;
    const iterations = Math.round(
      lerp(minIter, maxIter, Math.pow(t, 0.9))
    );

    const settle = 20; // throw away first few to let fern "settle"
    const points: FernPoint[] = [];

    // Fern coords roughly: x in [-2.5, 2.5], y in [0, 10.5]
    const minX = -2.5;
    const maxX = 2.5;
    const minY = 0;
    const maxY = 10.5;

    let x = 0;
    let y = 0;
    let id = 0;

    for (let i = 0; i < iterations + settle; i++) {
      const r = rng();
      const next = barnsleyStep(x, y, r);
      x = next.x;
      y = next.y;

      if (i < settle) continue;

      const nx =
        ((x - minX) / (maxX - minX)) * 100; // 0–100
      const ny =
        ((y - minY) / (maxY - minY)) * 100; // 0–100

      // Flip vertically so stem is near bottom
      const svgY = 100 - ny;

      // Color by "height" + a little randomness
      const heightFactor = ny / 100; // 0 bottom → 1 top
      const paletteIndex = Math.floor(
        (heightFactor * (palette.length - 1) +
          rng() * 0.8) %
          palette.length
      );
      const color = palette[paletteIndex];

      const baseOpacity = lerp(0.45, 0.9, t);
      const opacity =
        baseOpacity * (0.7 + rng() * 0.4);

      points.push({
        id: id++,
        x: nx,
        y: svgY,
        color,
        opacity,
      });
    }

    const background =
      "radial-gradient(circle at 50% 120%, rgba(15,23,42,1), #020617 70%)";

    return { points, background };
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
        {points.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={0.25}
            fill={p.color}
            fillOpacity={p.opacity}
          />
        ))}
      </svg>
    </div>
  );
};

export default FernArt;
