import React, { type CSSProperties, useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";

interface Shard {
  id: number;
  rotation: number;   // deg
  length: number;     // px
  width: number;      // px
  skew: number;       // deg
  color: string;
  opacity: number;
  glow: number;       // px
}

const CrystalArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { shards, background } = useMemo(() => {
    const rng = makeRng(seed + 808);
    const t = clamp(complexity / 100);

    // number of shards
    const minShards = 16;
    const maxShards = 70;
    const shardCount = Math.round(
      lerp(minShards, maxShards, Math.pow(t, 0.85))
    );

    // shard geometry
    const baseLength = lerp(120, 260, Math.pow(t, 0.8));
    const baseWidth = lerp(18, 40, 1 - t); // fatter at low complexity
    const maxSkew = lerp(4, 22, Math.pow(t, 1.2));

    const list: Shard[] = [];

    for (let i = 0; i < shardCount; i++) {
      const rotation = rng() * 360;

      const length =
        baseLength * (0.75 + rng() * 0.6); // ±25–30%
      const width =
        baseWidth * (0.7 + rng() * 0.7);   // ±30–35%
      const skew = (rng() - 0.5) * 2 * maxSkew;

      const color =
        palette[Math.floor(rng() * palette.length)];

      // much stronger opacity so they really show up
      const minOpacity = lerp(0.45, 0.6, t);
      const maxOpacity = lerp(0.75, 0.95, t);
      const opacity =
        minOpacity + rng() * (maxOpacity - minOpacity);

      const glow = lerp(10, 26, t);

      list.push({
        id: i,
        rotation,
        length,
        width,
        skew,
        color,
        opacity,
        glow,
      });
    }

    const background =
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), rgba(15,23,42,1) 55%, #020617 100%)";

    return { shards: list, background };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{
        backgroundImage: background,
      }}
    >
      {shards.map((s) => {
        const style: CSSProperties = {
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: `${s.width}px`,
          height: `${s.length}px`,
          transform: `
            translate(-50%, -50%)
            rotate(${s.rotation}deg)
            skewX(${s.skew}deg)
          `,
          transformOrigin: "50% 90%",
          background: s.color,
          opacity: s.opacity,
          borderRadius: "4px",
          mixBlendMode: "screen",
          boxShadow: `
            0 0 ${s.glow * 1.2}px rgba(255,255,255,0.55),
            0 0 ${s.glow * 0.9}px rgba(15,23,42,0.7) inset
          `,
        };

        return <div key={s.id} style={style} />;
      })}

      {/* core disc to tie it together */}
      <div
        style={{
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: "220px",
          height: "220px",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.5), rgba(15,23,42,0.9) 70%, transparent 100%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default CrystalArt;
