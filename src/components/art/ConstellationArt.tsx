import React, {
  type CSSProperties,
  useMemo
} from "react";
import type { ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";

interface ConstellationPoint {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  glow: number;
}

interface ConstellationLine {
  id: string;
  a: ConstellationPoint;
  b: ConstellationPoint;
}

const ConstellationArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { points, lines, background } = useMemo(() => {
    const rng = makeRng(seed + 303);
    const plex = clamp(complexity / 100);
  
    // star count
    const minStars = 10;
    const maxStars = 40;
    const starCount = Math.round(lerp(minStars, maxStars, plex));

    // connection density: low complexity = sparse, high = webby
    const baseConnectProb = lerp(0.25, 0.7, plex);

    const pts: ConstellationPoint[] = [];
    for (let i = 0; i < starCount; i++) {
      pts.push({
        id: i,
        x: rng() * 100, // vw
        y: rng() * 100, // vh
        size: 2 + rng() * 5, // px
        color: palette[Math.floor(rng() * palette.length)],
        glow: 0.3 + rng() * 0.7,
      });
    }

    const ln: ConstellationLine[] = [];
    for (let i = 0; i < starCount - 1; i++) {
      if (rng() < baseConnectProb) {
        const j = i + 1 + Math.floor(rng() * 3);
        if (j < starCount) {
          ln.push({ id: `${i}-${j}`, a: pts[i], b: pts[j] });
        }
      }
    }

    const bg = `radial-gradient(circle at 50% 10%, rgba(255,255,255,0.12), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 50%), #020617`;

    return { points: pts, lines: ln, background: bg };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{
        backgroundImage: background,
      }}
    >
      {lines.map((ln) => {
        const dx = ln.b.x - ln.a.x;
        const dy = ln.b.y - ln.a.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        const style: CSSProperties = {
          position: "absolute",
          left: `${ln.a.x}vw`,
          top: `${ln.a.y}vh`,
          width: `${length}vw`,
          height: "1px",
          background: "rgba(255,255,255,0.33)",
          transformOrigin: "0 0",
          transform: `rotate(${angle}deg)`,
          mixBlendMode: "screen",
        };

        return <div key={ln.id} style={style} />;
      })}

      {points.map((p) => {
        const style: CSSProperties = {
          position: "absolute",
          left: `${p.x}vw`,
          top: `${p.y}vh`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: "9999px",
          background: p.color,
          boxShadow: `0 0 ${12 * p.glow}px rgba(255,255,255,0.9)`,
          transform: "translate(-50%, -50%)",
        };
        return <div key={p.id} style={style} />;
      })}
    </div>
  );
};

export default ConstellationArt;