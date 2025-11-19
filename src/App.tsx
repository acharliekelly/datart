import React, { useMemo, type CSSProperties } from "react";
import "./App.css";

/* ---------- utils: hashing + RNG ---------- */

function hashStringToInt(str: string, max = 1_000_000): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % max;
}

function makeRng(seed: number): () => number {
  return function next() {
    // simple LCG
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/* ---------- types ---------- */

type StyleId = "orbits" | "strata" | "constellation";

interface UserTraits {
  fingerprint: string;
  timeZone: string;
  userAgent: string;
  language: string;
}

interface ArtStyleProps {
  seed: number;
  palette: string[];
}

/* ---------- user traits / fingerprint ---------- */

function getUserTraits(): UserTraits {
  if (typeof window === "undefined") {
    // safety for SSR/build
    return {
      fingerprint: "server",
      timeZone: "UTC",
      userAgent: "unknown",
      language: "en-US",
    };
  }

  const ua = navigator.userAgent || "";
  const lang = navigator.language || "";
  const tz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const darkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const fingerprint = [
    ua,
    lang,
    tz,
    w,
    h,
    dpr,
    darkMode ? "dark" : "light",
  ].join("|");

  return { fingerprint, timeZone: tz, userAgent: ua, language: lang };
}

/* ---------- palette + style selection ---------- */

function generatePalette(rng: () => number): string[] {
  const baseHue = Math.floor(rng() * 360);
  const palette: string[] = [];
  for (let i = 0; i < 5; i++) {
    const hue = (baseHue + i * 40) % 360;
    const sat = 40 + rng() * 40; // 40–80
    const light = 30 + rng() * 50; // 30–80
    palette.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }
  return palette;
}

function chooseStyle(
  timeZone: string,
  userAgent: string,
  numericSeed: number
): StyleId {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

  if (timeZone.startsWith("America/")) return "orbits";
  if (timeZone.startsWith("Europe/")) return "strata";
  if (isMobile) return "constellation";

  const styles: StyleId[] = ["orbits", "strata", "constellation"];
  return styles[numericSeed % styles.length];
}

/* ---------- style 1: ORBITS ---------- */

interface OrbitShape {
  id: number;
  size: number;
  thickness: number;
  color: string;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

const OrbitArt: React.FC<ArtStyleProps> = ({ seed, palette }) => {
  const shapes = useMemo<OrbitShape[]>(() => {
    const rng = makeRng(seed + 101);
    const circles: OrbitShape[] = [];
    const count = 10 + Math.floor(rng() * 10); // 10–19 rings

    for (let i = 0; i < count; i++) {
      const size = 80 + rng() * 420; // px
      const thickness = 1 + rng() * 6;
      const color = palette[Math.floor(rng() * palette.length)];
      const rotation = rng() * 360;
      const offsetX = (rng() - 0.5) * 80; // px
      const offsetY = (rng() - 0.5) * 80; // px

      circles.push({
        id: i,
        size,
        thickness,
        color,
        rotation,
        offsetX,
        offsetY,
      });
    }
    return circles;
  }, [seed, palette]);

  return (
    <div className="style-layer">
      {shapes.map((c) => {
        const style: CSSProperties = {
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: `${c.size}px`,
          height: `${c.size}px`,
          borderRadius: "9999px",
          border: `${c.thickness}px solid ${c.color}`,
          transform: `translate(-50%, -50%) translate(${c.offsetX}px, ${c.offsetY}px) rotate(${c.rotation}deg)`,
          mixBlendMode: "screen",
          opacity: 0.4,
        };
        return <div key={c.id} style={style} />;
      })}
      {/* central "planet" */}
      <div
        style={{
          position: "absolute",
          left: "50vw",
          top: "50vh",
          width: "80px",
          height: "80px",
          borderRadius: "9999px",
          background: palette[0],
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 60px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
};

/* ---------- style 2: STRATA ---------- */

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
    const rng = makeRng(seed + 202);
    const list: StrataBand[] = [];
    const count = 10 + Math.floor(rng() * 10);

    for (let i = 0; i < count; i++) {
      const thickness = 10 + rng() * 80; // px
      const top = rng() * 100; // vh
      const angle = (rng() - 0.5) * 12; // -6 to +6 deg
      const color = palette[Math.floor(rng() * palette.length)];
      const opacity = 0.2 + rng() * 0.7;

      list.push({
        id: i,
        thickness,
        top,
        angle,
        color,
        opacity,
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

/* ---------- style 3: CONSTELLATION ---------- */

interface ConstellationPoint {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  glow: number;
}

interface ConstellationLine {
  id: string;
  a: ConstellationPoint;
  b: ConstellationPoint;
}

const ConstellationArt: React.FC<ArtStyleProps> = ({ seed, palette }) => {
  const { points, lines, background } = useMemo<{
    points: ConstellationPoint[];
    lines: ConstellationLine[];
    background: string;
  }>(() => {
    const rng = makeRng(seed + 303);
    const count = 18 + Math.floor(rng() * 12); // 18–29 points
    const pts: ConstellationPoint[] = [];

    for (let i = 0; i < count; i++) {
      pts.push({
        id: i,
        x: rng() * 100, // vw
        y: rng() * 100, // vh
        size: 2 + rng() * 5, // px
        color: palette[Math.floor(rng() * palette.length)],
        glow: 0.3 + rng() * 0.7,
      });
    }

    const ln: ConstellationLine[] = [];
    for (let i = 0; i < count - 1; i++) {
      if (rng() < 0.6) {
        const j = i + 1 + Math.floor(rng() * 3);
        if (j < count) {
          ln.push({ id: `${i}-${j}`, a: pts[i], b: pts[j] });
        }
      }
    }

    const bg = `radial-gradient(circle at 50% 10%, rgba(255,255,255,0.12), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 50%), #020617`;

    return { points: pts, lines: ln, background: bg };
  }, [seed, palette]);

  return (
    <div
      className="style-layer"
      style={{
        backgroundImage: background,
      }}
    >
      {lines.map((ln) => {
        const dx = ln.b.x - ln.a.x;
        const dy = ln.b.y - ln.a.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        const style: CSSProperties = {
          position: "absolute",
          left: `${ln.a.x}vw`,
          top: `${ln.a.y}vh`,
          width: `${length}vw`,
          height: "1px",
          background: "rgba(255,255,255,0.33)",
          transformOrigin: "0 0",
          transform: `rotate(${angle}deg)`,
          mixBlendMode: "screen",
        };

        return <div key={ln.id} style={style} />;
      })}

      {points.map((p) => {
        const style: CSSProperties = {
          position: "absolute",
          left: `${p.x}vw`,
          top: `${p.y}vh`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: "9999px",
          background: p.color,
          boxShadow: `0 0 ${12 * p.glow}px rgba(255,255,255,0.9)`,
          transform: "translate(-50%, -50%)",
        };
        return <div key={p.id} style={style} />;
      })}
    </div>
  );
};

/* ---------- main app ---------- */

const App: React.FC = () => {
  const { styleId, palette, background, seed } = useMemo<{
    styleId: StyleId;
    palette: string[];
    background: string;
    seed: number;
  }>(() => {
    const traits = getUserTraits();
    const baseSeed = hashStringToInt(traits.fingerprint);
    const rngForPalette = makeRng(baseSeed);

    const palette = generatePalette(rngForPalette);
    const background = "#020617"; // default; styles can override

    const styleId = chooseStyle(
      traits.timeZone,
      traits.userAgent,
      baseSeed
    );

    return { styleId, palette, background, seed: baseSeed };
  }, []);

  let StyleComponent: React.FC<ArtStyleProps> = OrbitArt;
  if (styleId === "strata") StyleComponent = StrataArt;
  if (styleId === "constellation") StyleComponent = ConstellationArt;

  return (
    <div className="art-root" style={{ background }}>
      <StyleComponent seed={seed} palette={palette} />

      <div className="art-label">
        datart · {styleId} · client-side generative
      </div>
    </div>
  );
};

export default App;
