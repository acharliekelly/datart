import React, { useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";


interface Branch {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: string;
  opacity: number;
}


function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}


const RecursiveTreeArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { branches, background } = useMemo(() => {
    const rng = makeRng(seed + 7777);
    const t = clamp01(complexity / 100);

    // recursion depth: 3–8
    const minDepth = 3;
    const maxDepth = 8;
    const depth = Math.round(lerp(minDepth, maxDepth, Math.pow(t, 0.8)));

    // branch angle spread (degrees)
    const minSpread = 16;
    const maxSpread = 38;
    const spread = lerp(minSpread, maxSpread, Math.pow(t, 1.1));

    // length decay factor
    const minDecay = 0.63;
    const maxDecay = 0.78;
    const lengthDecay = lerp(maxDecay, minDecay, t); // higher complexity = quicker taper

    // base thickness
    const baseWidth = lerp(1.6, 3.4, 1 - t); // thicker trunk at low complexity

    const branches: Branch[] = [];
    let branchId = 0;

    interface StackItem {
      x: number;
      y: number;
      length: number;
      angle: number; // degrees, 0 = up
      level: number;
    }

    const stack: StackItem[] = [];

    // start with trunk from bottom-center going up
    stack.push({
      x: 50,
      y: 100,
      length: lerp(22, 32, t), // vh in svg coords
      angle: -90,
      level: 0,
    });

    while (stack.length > 0) {
      const current = stack.pop()!;
      const { x, y, length, angle, level } = current;

      const rad = (angle * Math.PI) / 180;
      const x2 = x + length * Math.cos(rad);
      const y2 = y + length * Math.sin(rad);

      const width = baseWidth * Math.pow(0.75, level) * (0.9 + rng() * 0.2);
      const color =
        palette[Math.floor(rng() * palette.length)] || "#a3e635";

      const opacity =
        lerp(0.6, 0.9, 1 - level / (depth + 1)) *
        (0.8 + rng() * 0.4);

      branches.push({
        id: branchId++,
        x1: x,
        y1: y,
        x2,
        y2,
        width,
        color,
        opacity,
      });

      if (level >= depth) continue;

      // how many children? 2–3 with some randomness
      const childCount = rng() < 0.2 ? 3 : 2;

      for (let i = 0; i < childCount; i++) {
        const sign = i === 0 ? -1 : 1;
        const angleJitter = (rng() - 0.5) * 10; // ±5°
        const childAngle =
          angle + sign * spread * (0.7 + rng() * 0.5) + angleJitter;

        const childLength =
          length * lengthDecay * (0.8 + rng() * 0.35);

        // attach children not from tip, but a bit up the branch
        const attachFactor = 0.3 + rng() * 0.5;
        const attachX = x + (x2 - x) * attachFactor;
        const attachY = y + (y2 - y) * attachFactor;

        stack.push({
          x: attachX,
          y: attachY,
          length: childLength,
          angle: childAngle,
          level: level + 1,
        });
      }
    }

    const background =
      "radial-gradient(circle at 50% 115%, rgba(15,23,42,1), #020617 70%)";

    return { branches, background };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{ backgroundImage: background }}
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
        {branches.map((b) => (
          <line
            key={b.id}
            x1={b.x1}
            y1={b.y1}
            x2={b.x2}
            y2={b.y2}
            stroke={b.color}
            strokeWidth={b.width}
            strokeOpacity={b.opacity}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
};

export default RecursiveTreeArt;
