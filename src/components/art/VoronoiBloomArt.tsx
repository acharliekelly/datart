import React, { type CSSProperties, useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";

interface Site {
  id: number;
  x: number;  // percentage-ish 0–100
  y: number;
  color: string;
}

interface CellRect {
  id: string;
  left: number;  // vw
  top: number;   // vh
  width: number; // vw
  height: number;// vh
  color: string;
  opacity: number;
  blur: number;
  borderColor: string;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

//
// Lightweight Voronoi: sample a grid, assign each sample cell to nearest site.
// We draw each sample cell as a blurred block -> organic cells.
//
const VoronoiBloomArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { rects, background } = useMemo(() => {
    const rng = makeRng(seed + 1717);
    const t = clamp01(complexity / 100);

    //
    // Number of sites
    //
    const minSites = 6;
    const maxSites = 32;
    const siteCount = Math.round(lerp(minSites, maxSites, Math.pow(t, 0.8)));

    const sites: Site[] = [];

    // slight margins to avoid too many edge cells
    const margin = 8;
    for (let i = 0; i < siteCount; i++) {
      const x = margin + rng() * (100 - margin * 2);
      const y = margin + rng() * (100 - margin * 2);
      const color = palette[Math.floor(rng() * palette.length)];
      sites.push({ id: i, x, y, color });
    }

    //
    // Sample grid: bigger grid for higher complexity
    //
    const minRes = 12;
    const maxRes = 35;
    const resolution = Math.round(lerp(minRes, maxRes, Math.pow(t, 1.1)));

    const cellW = 100 / resolution; // in vh/vw-like %
    const cellH = 100 / resolution;

    const rects: CellRect[] = [];

    let rectId = 0;

    for (let gy = 0; gy < resolution; gy++) {
      for (let gx = 0; gx < resolution; gx++) {
        // sample point inside this grid cell
        const sx = gx * cellW + cellW * 0.5;
        const sy = gy * cellH + cellH * 0.5;

        // find nearest site
        let nearest: Site | null = null;
        let bestDist = Infinity;

        for (const s of sites) {
          const dx = s.x - sx;
          const dy = s.y - sy;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            nearest = s;
          }
        }

        if (!nearest) continue;

        // opacity + blur = bloom intensity
        const opacity = lerp(0.25, 0.7, t) * (0.8 + rng() * 0.4);
        const blur = lerp(4, 22, t * 0.8);

        // slight border color variation
        const borderColor = nearest.color + "88";

        rects.push({
          id: `cell-${rectId++}`,
          left: (gx * cellW),
          top: (gy * cellH),
          width: cellW,
          height: cellH,
          color: nearest.color,
          opacity,
          blur,
          borderColor,
        });
      }
    }

    const background =
      "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.10), transparent 55%), #020617";

    return { rects, background };
  }, [seed, palette, complexity]);

  return (
    <div className="style-layer" style={{ backgroundImage: background }}>
      {rects.map((r) => {
        const style: CSSProperties = {
          position: "absolute",
          left: `${r.left}vw`,
          top: `${r.top}vh`,
          width: `${r.width}vw`,
          height: `${r.height}vh`,
          background: r.color,
          opacity: r.opacity,
          filter: `blur(${r.blur}px)`,
          mixBlendMode: "screen",
          borderRadius: "4px",
          boxShadow: `
            0 0 ${r.blur * 1.5}px ${r.color},
            inset 0 0 ${r.blur * 1.2}px ${r.borderColor}
          `,
        };
        return <div key={r.id} style={style} />;
      })}
    </div>
  );
};

export default VoronoiBloomArt;
