import React, {
  type CSSProperties,
  useMemo,
} from "react";
import type { BaseArtProps } from "../../logic/types";
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

const OrbitArt: React.FC<BaseArtProps> = ({ seed, palette, complexity }) => {
  
  const shapes = useMemo<OrbitShape[]>(() => {
    const rng = makeRng(seed + 101);

    // complexity 0-100 >> ~5-40 rings
    const minCount = 5;
    const maxCount = 40;
    const t = complexity / 100; // 0-1
    const targetCount = Math.round(
      minCount + t * (maxCount - minCount)
    );

    const circles: OrbitShape[] = [];
    for (let i = 0; i < targetCount; i++) {
      circles.push({
        id: i,
        size: 60 + rng() * 460,
        thickness: 1 + rng() * 6,
        color: palette[Math.floor(rng() * palette.length)],
        rotation: rng() * 360,
        offsetX: (rng() - 0.5) * 100,
        offsetY: (rng() - 0.5) * 100,
      });
    }
    return circles;
  }, [seed, palette, complexity]);

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