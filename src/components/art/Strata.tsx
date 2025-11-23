import React, {
  type CSSProperties,
  useMemo,
} from "react";
import type { ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";

interface StrataBand {
  id: number;
  thickness: number;
  top: number;
  angle: number;
  color: string;
  opacity: number;
}

const StrataArt: React.FC<ArtStyleProps> = ({ seed, palette, complexity }) => {
  const { bands, backgroundGradient } = useMemo(() => {
    const rng = makeRng(seed + 202);
    const plex = clamp(complexity / 100);

    // map complexity to band count
    const minBands = 6;
    const maxBands = 26;
    const bandCount = Math.round(lerp(minBands, maxBands, plex));

    // thickness: thick bands at low complexity, thinner at high
    const minThickness = 14;
    const maxThickness = 80;
    // invert plex so low complexity >> closer to maxThickness
    const thicknessBase = lerp(maxThickness, minThickness, plex);

    // tilt: subtle at low complexity, wilder at high, with soft curve
    const maxTiltDeg = lerp(2, 14, Math.pow(plex, 1.2));  // non-linear so it doesn't explode

    const list: StrataBand[] = [];

    for (let i = 0; i < bandCount; i++) {
      const thicknessJitter = (rng() - 0.5) * 0.4 * thicknessBase; // +/- 20%
      const thickness = Math.max(6, thicknessBase + thicknessJitter);

      const top = rng() * 100;
      const angle = (rng() - 0.5) * 2 * maxTiltDeg;
      const color = palette[Math.floor(rng() * palette.length)];

      // more overlap / opacity variation at higher complexity
      const minOpacity = lerp(0.15, 0.25, plex);
      const maxOpacity = lerp(0.5, 0.85, plex);
      const opacity = minOpacity + rng() * (maxOpacity - minOpacity);

      list.push({
        id: i,
        thickness,
        top,
        angle,
        color,
        opacity,
      });
    }

    const stops = palette
      .map((c, idx) => `${c} ${idx * (100 / palette.length)}%`)
      .join(", ");
    const backgroundGradient = `linear-gradient(135deg, ${stops})`;

    return { bands: list, backgroundGradient };
  }, [seed, palette, complexity]);

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