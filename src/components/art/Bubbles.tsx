import React, { type CSSProperties, useMemo } from "react";
import type { BaseArtProps, BubblesOptions } from "../../logic/types";
import { makeRng } from "../../logic/rng";

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

export const BubblesArt: React.FC<BaseArtProps> = ({
  seed,
  palette,
  options,
}) => {
  const opts = (options ?? {}) as Partial<BubblesOptions>;

  const bubbleCount = opts.bubbleCount ?? 26;
  const spread = opts.spread ?? 220;

  const bubbles = useMemo<Bubble[]>(() => {
    const rng = makeRng(seed + 404);
    const list: Bubble[] = [];

    const count =
      bubbleCount + Math.floor((rng() - 0.5) * bubbleCount * 0.2); // ±20%
    const finalCount = Math.max(6, count);

    for (let i = 0; i < finalCount; i++) {
      const r = Math.sqrt(rng()) * spread;
      const theta = rng() * Math.PI * 2;

      const offsetX = r * Math.cos(theta);
      const offsetY = r * Math.sin(theta);

      const size = 40 + rng() * 160;
      const color = palette[Math.floor(rng() * palette.length)];
      const opacity = 0.25 + rng() * 0.6;
      const blur = 12 + rng() * 40;
      const borderLightness = 55 + rng() * 25;

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
  }, [seed, palette, bubbleCount, spread]);

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
          background: b.color,
          opacity: b.opacity,
          transform: `translate(-50%, -50%) translate(${b.offsetX}px, ${b.offsetY}px)`,
          boxShadow: `0 0 ${b.blur}px rgba(255,255,255,0.85)`,
          border: `1px solid hsl(0, 0%, ${b.borderLightness}%)`,
          mixBlendMode: "screen",
        };

        return <div key={b.id} style={style} />;
      })}

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