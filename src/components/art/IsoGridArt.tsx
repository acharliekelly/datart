import React, { type CSSProperties, useMemo } from "react";
import { type ArtStyleProps } from "../../logic/types";
import { makeRng } from "../../logic/rng";
import { clamp, lerp } from "../../logic/styleUtils";

interface IsoTile {
  id: number;
  x: number;  // vw
  y: number;  // vh
  size: number; // px
  rotation: number; // deg
  skew: number; // deg
  colorA: string;
  colorB: string;
  opacity: number;
  elevation: number;
}

const IsoGridArt: React.FC<ArtStyleProps> = ({
  seed,
  palette,
  complexity,
}) => {
  const { tiles, background } = useMemo(() => {
    const rng = makeRng(seed + 707);
    const t = clamp(complexity / 100);

    // --- grid shape ---
    // more rows & columns as complexity rises
    const minRows = 3;
    const maxRows = 9;
    const minCols = 6;
    const maxCols = 16;

    const rows = Math.round(lerp(minRows, maxRows, t));
    const cols = Math.round(lerp(minCols, maxCols, t));

    // tile size: larger when simple, smaller when complex
    const minSize = 26;
    const maxSize = 80;
    const baseSize = lerp(maxSize, minSize, t);

    // vertical layout: center a band of rows around mid-screen
    const centerY = 50; // vh
    const rowSpacing = lerp(9, 6, t); // vh per row
    const totalHeight = (rows - 1) * rowSpacing;
    const startY = centerY - totalHeight / 2;

    // horizontal layout: spread tiles across most of width
    const startX = 15;
    const endX = 85;
    const colSpacing = (endX - startX) / Math.max(1, cols - 1);

    // perspective exaggeration
    const maxSkew = lerp(8, 18, Math.pow(t, 1.2)); // deg
    const jitterScale = lerp(0.25, 0.9, t);

    const tiles: IsoTile[] = [];
    let id = 0;

    for (let row = 0; row < rows; row++) {
      // stagger odd rows to get a pseudo-isometric lattice
      const rowOffsetX = (row % 2 === 0 ? 0 : colSpacing / 2);

      for (let col = 0; col < cols; col++) {
        const baseX = startX + col * colSpacing + rowOffsetX;
        const baseY = startY + row * rowSpacing;

        const jitterX =
          (rng() - 0.5) * colSpacing * jitterScale;
        const jitterY =
          (rng() - 0.5) * rowSpacing * jitterScale;

        const x = baseX + jitterX;
        const y = baseY + jitterY;

        const sizeJitter =
          (rng() - 0.5) * baseSize * 0.3;
        const size = Math.max(18, baseSize + sizeJitter);

        const rotation = 45 + (rng() - 0.5) * 5;
        const skew = (rng() - 0.5) * 2 * maxSkew;

        const colorA =
          palette[Math.floor(rng() * palette.length)];
        const colorB =
          palette[Math.floor(rng() * palette.length)];

        const opacity =
          lerp(0.55, 0.9, t) *
          (0.85 + rng() * 0.3);

        const elevation = rng();

        tiles.push({
          id: id++,
          x,
          y,
          size,
          rotation,
          skew,
          colorA,
          colorB,
          opacity,
          elevation,
        });
      }
    }

    const background =
      "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.10), transparent 55%), #020617";

    return { tiles, background };
  }, [seed, palette, complexity]);

  return (
    <div
      className="style-layer"
      style={{
        backgroundImage: background,
        overflow: "hidden",
      }}
    >
      {tiles.map((tile) => {
        const shadowStrength = 10 + tile.elevation * 20;
        const highlight = `rgba(255,255,255,${
          0.14 + tile.elevation * 0.25
        })`;

        const style: CSSProperties = {
          position: "absolute",
          left: `${tile.x}vw`,
          top: `${tile.y}vh`,
          width: `${tile.size}px`,
          height: `${tile.size}px`,
          transform: `
            translate(-50%, -50%)
            rotate(${tile.rotation}deg)
            skewY(${tile.skew}deg)
          `,
          transformOrigin: "50% 50%",
          background: `linear-gradient(135deg, ${tile.colorA}, ${tile.colorB})`,
          opacity: tile.opacity,
          mixBlendMode: "screen",
          boxShadow: `
            0 ${shadowStrength}px ${shadowStrength * 1.4}px rgba(0,0,0,0.55),
            0 0 ${shadowStrength * 0.6}px ${highlight}
          `,
          borderRadius: "6px",
        };

        return <div key={tile.id} style={style} />;
      })}
    </div>
  );
};

export default IsoGridArt;
