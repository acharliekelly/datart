import React, {
  type CSSProperties,
  useMemo,
} from "react";
import type { BaseArtProps, StrataOptions } from "../../logic/types";
import { makeRng } from "../../logic/rng";

/* ===========================================
 *  STYLE 2: STRATA
 * ===========================================
 */

interface StrataBand {
  id: number;
  thickness: number;
  top: number;
  angle: number;
  color: string;
  opacity: number;
}

const StrataArt: React.FC<BaseArtProps> = ({ seed, palette, options }) => {
  const opts = (options ?? {}) as Partial<StrataOptions>;
  const bandCount = opts.bandCount ?? 16;
  const maxTilt = opts.maxTilt ?? 8;
  // use bandCount in place of the 10–20 count, and maxTilt for angle range

  const bands = useMemo<StrataBand[]>(() => {
    const rng = makeRng(seed + 202);
    const list: StrataBand[] = [];

    for (let i = 0; i < bandCount; i++) {
      list.push({
        id: i,
        thickness: 10 + rng() * 80, // px
        top: rng() * 100, // vh
        angle: (rng() - 0.5) * maxTilt, // -6 to +6 deg
        color: palette[Math.floor(rng() * palette.length)],
        opacity: 0.2 + rng() * 0.7,
      });
    }
    return list;
  }, [seed, palette, bandCount, maxTilt]);

  const backgroundGradient = useMemo<string>(() => {
    const stops = palette
      .map((c, idx) => `${c} ${idx * (100 / palette.length)}%`)
      .join(", ");
    return `linear-gradient(135deg, ${stops})`;
  }, [palette]);

  return (
    <div
      className="style-layer"
      style={{
        backgroundImage: backgroundGradient,
        filter: "saturate(1.1)",
      }}
    >
      {bands.map((b) => {
        const style: CSSProperties = {
          position: "absolute",
          left: "-10vw",
          top: `${b.top}vh`,
          width: "120vw",
          height: `${b.thickness}px`,
          background: b.color,
          opacity: b.opacity,
          transform: `rotate(${b.angle}deg)`,
          mixBlendMode: "multiply",
        };
        return <div key={b.id} style={style} />;
      })}

      {/* subtle inner frame */}
      <div className="subtle-frame"
        style={{
          position: "absolute",
          inset: "6vh 8vw",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 0 40px rgba(0,0,0,0.4) inset",
        }}
      />
    </div>
  );
};

export default StrataArt;