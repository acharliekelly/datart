import React, {
  type CSSProperties,
  useMemo,
} from "react";
import type { ArtStyleProps } from "../utils/types";
import * as traits from "../utils/fingerprint";

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

const StrataArt: React.FC<ArtStyleProps> = ({ seed, palette }) => {
  const bands = useMemo<StrataBand[]>(() => {
    const rng = traits.makeRng(seed + 202);
    const list: StrataBand[] = [];
    const count = 10 + Math.floor(rng() * 10);

    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        thickness: 10 + rng() * 80, // px
        top: rng() * 100, // vh
        angle: (rng() - 0.5) * 12, // -6 to +6 deg
        color: palette[Math.floor(rng() * palette.length)],
        opacity: 0.2 + rng() * 0.7,
      });
    }
    return list;
  }, [seed, palette]);

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
      <div
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