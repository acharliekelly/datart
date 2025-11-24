import React, { type CSSProperties, useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";

interface Curtain {
  id: number;
  x: number;        // vw
  width: number;    // px
  height: number;   // vh
  skew: number;     // deg
  wavePhase: number;
  waveAmp: number;  // px
  colorA: string;
  colorB: string;
  opacity: number;
  blur: number;     // px
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

const AuroraArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { curtains, background } = useMemo(() => {
    const rng = makeRng(seed + 1313);
    const t = clamp01(complexity / 100);

    // number of curtains
    const minCurtains = 5;
    const maxCurtains = 20;
    const curtainCount = Math.round(
      lerp(minCurtains, maxCurtains, Math.pow(t, 0.9))
    );

    // base width: wider at low complexity
    const minWidth = 30;
    const maxWidth = 120;
    const baseWidth = lerp(maxWidth, minWidth, t);

    // vertical span
    const minHeight = 70;
    const maxHeight = 110;
    const baseHeight = lerp(minHeight, maxHeight, t);

    // waviness and skew
    const maxSkew = lerp(4, 20, Math.pow(t, 1.2));
    const maxAmp = lerp(20, 80, Math.pow(t, 1.1)); // px horizontal wave amplitude

    const curtains: Curtain[] = [];

    for (let i = 0; i < curtainCount; i++) {
      const lane = i / curtainCount;
      const baseX = 10 + lane * 80; // 10–90vw range

      const jitterX = (rng() - 0.5) * 10; // vw
      const x = baseX + jitterX;

      const width =
        baseWidth * (0.7 + rng() * 0.6); // ±30%
      const height =
        baseHeight * (0.85 + rng() * 0.4); // vh

      const skew = (rng() - 0.5) * 2 * maxSkew;
      const wavePhase = rng() * Math.PI * 2;
      const waveAmp = maxAmp * (0.5 + rng() * 0.7);

      const colorA =
        palette[Math.floor(rng() * palette.length)];
      const colorB =
        palette[Math.floor(rng() * palette.length)];

      const minOpacity = lerp(0.25, 0.4, t);
      const maxOpacity = lerp(0.6, 0.9, t);
      const opacity =
        minOpacity + rng() * (maxOpacity - minOpacity);

      const blur = lerp(6, 24, Math.pow(t, 0.9));

      curtains.push({
        id: i,
        x,
        width,
        height,
        skew,
        wavePhase,
        waveAmp,
        colorA,
        colorB,
        opacity,
        blur,
      });
    }

    const background =
      "radial-gradient(circle at 50% 120%, rgba(15,23,42,1), #020617 70%)";

    return { curtains, background };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{
        backgroundImage: background,
      }}
    >
      {curtains.map((c) => {
        // We'll fake a wavy edge using a big blur + gradient
        const style: CSSProperties = {
          position: "absolute",
          left: `${c.x}vw`,
          top: "0vh",
          width: `${c.width}px`,
          height: `${c.height}vh`,
          transform: `
            translateX(-50%)
            skewX(${c.skew}deg)
          `,
          transformOrigin: "50% 100%",
          background: `
            linear-gradient(
              to top,
              rgba(0,0,0,0),
              ${c.colorB} 20%,
              ${c.colorA} 60%,
              rgba(255,255,255,0.7)
            )
          `,
          opacity: c.opacity,
          filter: `blur(${c.blur}px)`,
          mixBlendMode: "screen",
          borderRadius: "999px",
          boxShadow: `
            0 -20px 60px rgba(255,255,255,0.4),
            0 40px 80px rgba(0,0,0,0.9)
          `,
        };

        return <div key={c.id} style={style} />;
      })}

      {/* subtle horizon glow */}
      <div
        style={{
          position: "absolute",
          left: "50vw",
          bottom: "-5vh",
          width: "140vw",
          height: "40vh",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3), transparent 60%)",
          opacity: 0.45,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default AuroraArt;
