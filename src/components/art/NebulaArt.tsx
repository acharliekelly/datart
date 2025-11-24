import React, { type CSSProperties, useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";

interface Cloud {
  id: number;
  x: number;   // vw
  y: number;   // vh
  w: number;   // px width
  h: number;   // px height
  angle: number; // deg
  color: string;
  opacity: number;
  blur: number;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const NebulaArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { clouds, background } = useMemo(() => {
    const rng = makeRng(seed + 2024);
    const t = clamp01(complexity / 100);

    // More clouds = more turbulent detail
    const minClouds = 10;
    const maxClouds = 40;
    const cloudCount = Math.round(lerp(minClouds, maxClouds, t));

    // Sharper nebula = smaller blur + more elongated shapes
    const minBlur = 5;
    const maxBlur = 40;
    const blurBase = lerp(minBlur, maxBlur, Math.pow(t, 0.6));

    const minSize = 80;
    const maxSize = 280;
    const baseSize = lerp(maxSize, minSize, t);

    // Larger spread at high complexity
    const spread = lerp(20, 70, t);

    const clouds: Cloud[] = [];

    for (let i = 0; i < cloudCount; i++) {
      const r = Math.sqrt(rng()) * spread;
      const theta = rng() * Math.PI * 2;

      const x = 50 + r * Math.cos(theta);
      const y = 50 + r * Math.sin(theta) * 0.55;

      // Ellipses instead of circles: sharper, more directional nebula
      const w = baseSize * (0.6 + rng() * 0.8); // ±40%
      const h = w * (0.3 + rng() * 0.4);        // skinny vertically
      const angle = rng() * 360;

      const color = palette[Math.floor(rng() * palette.length)];

      // Sharper opacity: fewer washed-out layers
      const minOp = lerp(0.25, 0.35, t);
      const maxOp = lerp(0.75, 0.85, t);
      const opacity = minOp + rng() * (maxOp - minOp);

      // Much tighter blur — previous version was too soft
      const blur = blurBase * (0.6 + rng() * 0.4);

      clouds.push({
        id: i,
        x,
        y,
        w,
        h,
        angle,
        color,
        opacity,
        blur,
      });
    }

    const background =
      "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.12), transparent 45%), " +
      "#020617";

    return { clouds, background };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{ backgroundImage: background }}
    >
      {clouds.map((c) => {
        const style: CSSProperties = {
          position: "absolute",
          left: `${c.x}vw`,
          top: `${c.y}vh`,
          width: `${c.w}px`,
          height: `${c.h}px`,
          transform: `
            translate(-50%, -50%)
            rotate(${c.angle}deg)
          `,
          borderRadius: "50%",
          background: `
            radial-gradient(
              circle at 30% 30%,
              rgba(255,255,255,0.35),
              ${c.color}
            )
          `,
          opacity: c.opacity,
          filter: `blur(${c.blur}px)`,
          mixBlendMode: "screen",
        };

        return <div key={c.id} style={style} />;
      })}
    </div>
  );
};

export default NebulaArt;
