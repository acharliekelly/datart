import React, { type CSSProperties, useMemo } from "react";
import type { ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";


interface Bubble {
  id: number;
  size: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
  highlightStrength: number;
  rimStrength: number;
}

export const BubblesArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { bubbles, backgroundGlow } = useMemo(() => {
    const rng = makeRng(seed + 404);
    const plex = clamp(complexity / 100);

    // density: number of bubbles
    const minBubbles = 6;
    const maxBubbles = 30;
    const bubbleCount = Math.round(lerp(minBubbles, maxBubbles, plex));

    // size: bigger bubbles at low complexity, smaller & more at high
    const minSize = 30;
    const maxSize = 180;
    const baseSize = lerp(maxSize, minSize, plex);

    // spread: how far they drift from center
    const minSpread = 40;
    const maxSpread = 180;
    const spread = lerp(minSpread, maxSpread, Math.pow(plex, 1.2));

    const list: Bubble[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      // polar coordinates so distribution is radial
      const r = Math.sqrt(rng()) * spread;
      const theta = rng() * Math.PI * 2;

      const offsetX = r * Math.cos(theta);
      const offsetY = r * Math.sin(theta);

      const sizeJitter = (rng() - 0.5) * baseSize * 0.4; // ±40%
      const size = Math.max(18, baseSize + sizeJitter);

      const color = palette[Math.floor(rng() * palette.length)];

      // softer opacity overall so we don't get a giant burn-in
      const minOpacity = lerp(0.12, 0.22, plex);
      const maxOpacity = lerp(0.35, 0.5, plex);
      const opacity =
        minOpacity + rng() * (maxOpacity - minOpacity);

      // highlight & rim: more pronounced at lower complexity,
      // slightly more subtle but frequent at higher
      const highlightStrength = lerp(0.4, 0.7, 1 - plex); // more highlight at low complexity
      const rimStrength = lerp(0.3, 0.6, plex);

      list.push({
        id: i,
        size,
        offsetX,
        offsetY,
        color,
        opacity,
        highlightStrength,
        rimStrength,
      });
    }

    const backgroundGlow =
      "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.18), transparent 65%)," +
      "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12), transparent 70%)," +
      "#020617";

    return { bubbles: list, backgroundGlow };

  }, [seed, palette, complexity]);

  return (
    <div className="style-layer"
         style={{
          backgroundImage: backgroundGlow,
         }}
    >
      {bubbles.map((b) => {
        // we fake a bubble by:
        // - thinner rim (border)
        // - subtle highlight via inner / outer shadows
        const rimColor = `rgba(255,255,255,${0.25 + b.rimStrength * 0.4})`;
        const highlight = `rgba(255,255,255,${0.3 + b.highlightStrength * 0.4})`;

        const style: CSSProperties = {
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: `${b.size}px`,
          height: `${b.size}px`,
          borderRadius: "9999px",
          transform: `translate(-50%, -50%) translate(${b.offsetX}px, ${b.offsetY}px)`,
          background: `radial-gradient(circle at 30% 25%, ${highlight}, rgba(255,255,255,0.05) 40%, transparent 70%), ${b.color}`,
          opacity: b.opacity,
          border: `1px solid ${rimColor}`,
          boxShadow: `
            0 0 ${Math.max(6, b.size * 0.15)}px rgba(255,255,255,0.3),
            inset 0 0 ${Math.max(4, b.size * 0.12)}px rgba(0,0,0,0.35)
            `,
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