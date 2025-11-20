import React, { type CSSProperties, useMemo } from "react";
import type { ArtStyleProps } from "../utils/types";


interface Bubble {
  id: number;
  size: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
  blur: number;
  borderLightness: number;
}

function makeRng(seed: number): () => number {
  return function next() {
    // same LCG as elsewhere
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/**
 * Bubbles: loosely based on Orbits, but instead of rings centered on a point,
 * we scatter circular "bubbles" around the center with soft glow and overlap.
 */
const BubblesArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
}) => {
  const bubbles = useMemo<Bubble[]>(() => {
    const rng = makeRng(seed + 404);
    const list: Bubble[] = [];

    const count = 18 + Math.floor(rng() * 18); // 18–35 bubbles

    for (let i = 0; i < count; i++) {
      // Radius from center (bias toward center with sqrt)
      const r = Math.sqrt(rng()) * 220; // px from center
      const theta = rng() * Math.PI * 2;

      const offsetX = r * Math.cos(theta);
      const offsetY = r * Math.sin(theta);

      const size = 40 + rng() * 160; // 40–200 px
      const color = palette[Math.floor(rng() * palette.length)];
      const opacity = 0.25 + rng() * 0.6;
      const blur = 12 + rng() * 40; // px
      const borderLightness = 55 + rng() * 25; // for subtle highlight

      list.push({
        id: i,
        size,
        offsetX,
        offsetY,
        color,
        opacity,
        blur,
        borderLightness,
      });
    }

    return list;
  }, [seed, palette]);

  return (
    <div className="style-layer">
      {bubbles.map((b) => {
        const style: CSSProperties = {
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: `${b.size}px`,
          height: `${b.size}px`,
          borderRadius: "9999px",
          // solid fill + soft glow, screen blend for nice overlaps
          background: b.color,
          opacity: b.opacity,
          transform: `translate(-50%, -50%) translate(${b.offsetX}px, ${b.offsetY}px)`,
          boxShadow: `0 0 ${b.blur}px rgba(255,255,255,0.85)`,
          border: `1px solid hsl(0, 0%, ${b.borderLightness}%)`,
          mixBlendMode: "screen",
        };

        return <div key={b.id} style={style} />;
      })}

      {/* faint center "mist" to tie the composition together */}
      <div
        style={{
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: "320px",
          height: "320px",
          borderRadius: "9999px",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default BubblesArt;