import React, { useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";

interface Point {
  x: number;
  y: number;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// One iteration of the Koch subdivision on a closed polygon
function kochIter(points: Point[]): Point[] {
  const next: Point[] = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const p = points[i];
    const q = points[(i + 1) % n];

    const dx = (q.x - p.x) / 3;
    const dy = (q.y - p.y) / 3;

    const p1 = { x: p.x + dx, y: p.y + dy };
    const p3 = { x: p.x + 2 * dx, y: p.y + 2 * dy };

    // build the "peak" point p2 by rotating the middle segment by -60°
    const sqrt3over2 = Math.sqrt(3) / 2;
    const ux = dx;
    const uy = dy;
    const rx = ux * 0.5 - uy * sqrt3over2;
    const ry = ux * sqrt3over2 + uy * 0.5;
    const p2 = { x: p1.x + rx, y: p1.y + ry };

    next.push(p, p1, p2, p3);
  }

  return next;
}

const KochSnowflakeArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { pathData, stroke, fill, background, strokeWidth } = useMemo(() => {
    const rng = makeRng(seed + 5151);
    const t = clamp01(complexity / 100);

    // recursion depth: 1–4
    const minDepth = 1;
    const maxDepth = 4;
    const depth = Math.round(lerp(minDepth, maxDepth, Math.pow(t, 0.9)));

    // base equilateral triangle in roughly [-1,1] coordinates
    const r = 1;
    const p0: Point = { x: 0, y: r }; // top
    const p1: Point = {
      x: r * Math.sin((2 * Math.PI) / 3),
      y: r * Math.cos((2 * Math.PI) / 3),
    };
    const p2: Point = {
      x: r * Math.sin((4 * Math.PI) / 3),
      y: r * Math.cos((4 * Math.PI) / 3),
    };

    let points: Point[] = [p0, p1, p2];

    for (let i = 0; i < depth; i++) {
      points = kochIter(points);
    }

    // normalize to 0–100 svg coordinates and center
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const scale = (80 / Math.max(width, height)) * (0.95 + rng() * 0.1);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const scaledPoints = points.map((p) => {
      const sx = (p.x - cx) * scale + 50;
      const sy = (p.y - cy) * scale + 50;
      return { x: sx, y: sy };
    });

    const pathData =
      "M " +
      scaledPoints
        .map((p) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`)
        .join(" L ") +
      " Z";

    const stroke =
      palette[Math.floor(rng() * palette.length)] || "#ffffff";
    const fillBase =
      palette[Math.floor(rng() * palette.length)] || "#22d3ee";

    // subtle fill, mostly transparent
    const fill = fillBase + "33";

    const background =
      "radial-gradient(circle at 50% 130%, rgba(15,23,42,1), #020617 70%)";

    const strokeWidth = lerp(0.4, 1.2, 1 - t); // a bit thinner with more detail

    return { pathData, stroke, fill, background, strokeWidth };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{
        backgroundImage: background,
      }}
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
        <path
          d={pathData}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default KochSnowflakeArt;
