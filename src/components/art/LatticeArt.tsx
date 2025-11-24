import React, { useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";


interface Node {
  id: number;
  x: number; // 0–100 (svg units)
  y: number; // 0–100
  radius: number;
  color: string;
  opacity: number;
}

interface Link {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  opacity: number;
  color: string;
}

const LatticeArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { nodes, links, background } = useMemo(() => {
    const rng = makeRng(seed + 909);
    const t = clamp(complexity / 100);

    // number of nodes grows with complexity
    const minNodes = 12;
    const maxNodes = 70;
    const nodeCount = Math.round(
      lerp(minNodes, maxNodes, Math.pow(t, 0.8))
    );

    // connection radius (in svg units)
    const minRadius = 8;
    const maxRadius = 32;
    const connectRadius = lerp(
      minRadius,
      maxRadius,
      Math.pow(t, 0.9)
    );
    const connectRadiusSq = connectRadius * connectRadius;

    // connection probability
    const minProb = 0.1;
    const maxProb = 0.5;
    const connectProb = lerp(minProb, maxProb, t);

    // node size
    const minR = 0.4;
    const maxR = 1.8;
    const baseR = lerp(maxR, minR, t);

    const nodes: Node[] = [];

    // keep nodes away from extreme edges a bit
    const margin = 8;
    for (let i = 0; i < nodeCount; i++) {
      const x = margin + rng() * (100 - 2 * margin);
      const y = margin + rng() * (100 - 2 * margin);

      const radius =
        baseR * (0.7 + rng() * 0.6); // ±30%

      const color =
        palette[Math.floor(rng() * palette.length)];

      const opacity =
        lerp(0.4, 0.85, t) * (0.8 + rng() * 0.4);

      nodes.push({
        id: i,
        x,
        y,
        radius,
        color,
        opacity,
      });
    }

    const links: Link[] = [];

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const a = nodes[i];
        const b = nodes[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > connectRadiusSq) continue;
        if (rng() > connectProb) continue;

        const width = lerp(0.12, 0.5, t) * (0.8 + rng() * 0.4);
        const opacity =
          lerp(0.18, 0.5, t) * (0.8 + rng() * 0.5);

        const color =
          palette[Math.floor(rng() * palette.length)];

        links.push({
          id: `${i}-${j}`,
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          width,
          opacity,
          color,
        });
      }
    }

    const background =
      "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 55%), #020617";

    return { nodes, links, background };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{
        // don't touch position/inset; CSS handles that
        backgroundImage: background,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          mixBlendMode: "screen",
        }}
      >
        {/* links first, then nodes on top */}
        {links.map((l) => (
          <line
            key={l.id}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={l.color}
            strokeWidth={l.width}
            strokeOpacity={l.opacity}
          />
        ))}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={n.radius}
            fill={n.color}
            fillOpacity={n.opacity}
          />
        ))}
      </svg>
    </div>
  );
};

export default LatticeArt;