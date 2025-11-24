import React, { type CSSProperties, useMemo } from "react";
import type { ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";

interface WaveBand {
  id: number;
  top: number;  // vh
  thickness: number;  // px
  angle: number;  // deg
  offsetX: number;  // vw
  color: string;
  opacity: number;
  blur: number; // px
}

const WaveArt: React.FC<ArtStyleProps> = ({
  seed, palette, complexity,
}) => {
  const { bands, backgroundGradient } = useMemo(() => {
    const rng = makeRng(seed + 505);
    const plex = clamp(complexity / 100);

    // band count: calm at low complexity, rich interference at high
    const minBands = 6;
    const maxBands = 32;
    const bandCount = Math.round(
      lerp(minBands, maxBands, Math.pow(plex, 0.8))
    );

    // thickness: fewer but thicker at low, thinner at high
    const minThickness = 6;
    const maxThickness = 40;
    const baseThickness = lerp(maxThickness, minThickness, plex);

    // tilt: subtle at low, stronger at high
    const maxTilt = lerp(2, 18, Math.pow(plex, 1.2)); // degrees

    // horizontal drift: how much bands can slide horizontally
    const maxOffsetX = lerp(10, 40, plex);  // vw

    const list: WaveBand[] = [];

    for (let i = 0; i < bandCount; i++) {
      const top = rng() * 100;  // vh

      const thicknessJitter =
        (rng() - 0.5) * baseThickness * 0.5;  // +/- 25%
        const thickness = Math.max(
          4,
          baseThickness + thicknessJitter
        );
      
      const angle = (rng() - 0.5) * 2 * maxTilt;

      const offsetX = (rng() - 0.5) * 2 * maxOffsetX; // +/- maxOffsetX

      const color = palette[Math.floor(rng() * palette.length)];

      // opacity: more intense when complex, but never fully solid
      const minOpacity = lerp(0.12, 0.2, plex);
      const maxOpacity = lerp(0.35, 0.6, plex);
      const opacity = minOpacity + rng() * (maxOpacity - minOpacity);

      // blur: subtle smoothing, more at higher complexity
      const blur = lerp(4, 18, Math.pow(plex, 0.9));

      list.push({
        id: i,
        top,
        thickness,
        angle,
        offsetX,
        color,
        opacity,
        blur,
      });
    }

    const stops = palette
      .map((c, idx) => `${c} ${idx * (100 / palette.length)}%`)
      .join(", ");
    const backgroundGradient = `linear-gradient(180deg, ${stops})`;

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
            left: "-20vw",
            top: `${b.top}vh`,
            width: "140vw",
            height: `${b.thickness}px`,
            background: b.color,
            opacity: b.opacity,
            transform: `translateX(${b.offsetX}vw rotate(${b.angle}deg))`,
            mixBlendMode: "screen",
            boxShadow: `0 0 ${b.blur}px rgba(0,0,0,0.4)`,
          };

          return <div key={b.id} style={style} />
        })}
      </div>
  );

};

export default WaveArt;