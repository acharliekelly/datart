import React, {
  type CSSProperties,
  useMemo,
} from "react";
import type { BaseArtProps, OrbitsOptions } from "../../logic/types";
import { makeRng } from "../../logic/rng";

/* ===========================================
 *  STYLE 1: ORBITS
 * ===========================================
 */

interface OrbitShape {
  id: number;
  size: number;
  thickness: number;
  color: string;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

const OrbitArt: React.FC<BaseArtProps> = ({ seed, palette, options }) => {
  const opts = (options ?? {}) as Partial<OrbitsOptions>;
  const ringCount = opts.ringCount ?? 14;
  const jitter = opts.jitter ?? 80;

  // use ringCount & jitter instead of fixed values:
  // const count = 10 + Math.floor(rng() * 10);
  const shapes = useMemo<OrbitShape[]>(() => {
    const rng = makeRng(seed + 101);
    const count =
      ringCount + Math.floor((rng() - 0.5) * ringCount * 0.3); // ±30%
    const finalCount = Math.max(5, count);
    const circles: OrbitShape[] = [];

    for (let i = 0; i < finalCount; i++) {
      circles.push({
        id: i,
        size: 80 + rng() * 420,
        thickness: 1 + rng() * 6,
        color: palette[Math.floor(rng() * palette.length)],
        rotation: rng() * 360,
        offsetX: (rng() - 0.5) * jitter,
        offsetY: (rng() - 0.5) * jitter,
      });
    }
    return circles;
  }, [seed, palette, ringCount, jitter]);

  return (
    <div className="style-layer">
      {shapes.map((c) => {
        const style: CSSProperties = {
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: `${c.size}px`,
          height: `${c.size}px`,
          borderRadius: "9999px",
          border: `${c.thickness}px solid ${c.color}`,
          transform: `translate(-50%, -50%) translate(${c.offsetX}px, ${c.offsetY}px) rotate(${c.rotation}deg)`,
          mixBlendMode: "screen",
          opacity: 0.4,
        };
        return <div key={c.id} style={style} />;
      })}
      {/* central "planet" */}
      <div
        style={{
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: "80px",
          height: "80px",
          borderRadius: "9999px",
          background: palette[0],
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 60px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
};

export default OrbitArt;