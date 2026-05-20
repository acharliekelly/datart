// /src/logic/styleRules.ts

import { STYLES } from "../components/art/styleRegistry";
import type { StyleId, UserTraits } from "./types";

const STYLE_SELECTION_VERSION = "style-v2";
const DEMO_SAFE_STYLE_IDS: StyleId[] = [
  "orbits",
  "strata",
  "constellation",
  "bubbles",
  "waves",
  "supershape",
  "isogrid",
  "crystal",
  // "lattice",
  // "nebula",
  // "aurora",
  "koch",
  "tree",
  // "flowfield",
];

interface StyleSignal {
  label: string;
  value: string;
  weight: number;
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function getBrowserFamily(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const s = ua.toLowerCase();
  if (s.includes("edg/")) return "edge";
  if (s.includes("chrome/")) return "chrome";
  if (s.includes("firefox/")) return "firefox";
  if (s.includes("safari/")) return "safari";
  if (s.includes("opr/") || s.includes("opera")) return "opera";
  return null;
}

function getScreenBucket(traits: UserTraits): string {
  const shortSide = Math.min(traits.screenWidth, traits.screenHeight);
  const longSide = Math.max(traits.screenWidth, traits.screenHeight);
  const orientation = traits.screenWidth >= traits.screenHeight
    ? "landscape"
    : "portrait";

  if (longSide <= 0) return "unknown";
  if (shortSide < 600) return `small-${orientation}`;
  if (shortSide < 900) return `medium-${orientation}`;
  return `large-${orientation}`;
}

function getLanguageFamily(language: string): string {
  return language.split("-")[0]?.toLowerCase() || "unknown";
}

function hashToUnitInterval(input: string): number {
  return simpleHash(input) / 0xffffffff;
}

function getStyleSignals(traits: UserTraits): StyleSignal[] {
  const family = getBrowserFamily(traits.userAgent) ?? "unknown";
  const continent = traits.ipInfo?.continentCode ?? "unknown";
  const country = traits.ipInfo?.country ?? "unknown";
  const region = traits.ipInfo?.region ?? "unknown";
  const city = traits.ipInfo?.city ?? "unknown";
  const ip = traits.ipInfo?.ip ?? "none";
  const screen = getScreenBucket(traits);
  const language = getLanguageFamily(traits.language);
  const colorScheme = traits.darkMode ? "dark" : "light";
  const dprBucket = traits.devicePixelRatio >= 2 ? "high-dpr" : "standard-dpr";

  return [
    {
      label: "fingerprint",
      value: JSON.stringify(traits),
      weight: 6,
    },
    {
      label: "ip",
      value: ip,
      weight: traits.ipInfo?.ip ? 2.5 : 0.25,
    },
    {
      label: "geo",
      value: `${continent}/${country}/${region}/${city}`,
      weight: traits.ipInfo ? 1.5 : 0.35,
    },
    {
      label: "timezone",
      value: traits.timeZone || "unknown",
      weight: 1.25,
    },
    {
      label: "language",
      value: language,
      weight: 1,
    },
    {
      label: "browser",
      value: family,
      weight: 1,
    },
    {
      label: "screen",
      value: `${screen}/${dprBucket}`,
      weight: 0.9,
    },
    {
      label: "color",
      value: colorScheme,
      weight: 0.5,
    },
  ];
}

export interface StyleDecision {
  id: StyleId;
  reason: string;
}

function getDecision(styleId: StyleId, criterion: string): StyleDecision {
  return {
    id: styleId,
    reason: `${criterion} => ${styleId}`
  };
}

export function chooseStyle(
  traits: UserTraits, 
  numericSeed: number): StyleDecision {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(traits.userAgent);
  const continent = traits.ipInfo?.continentCode ?? "";
  const tz = traits.timeZone;

  if (continent === "NA") {
    return getDecision("orbits", "continent = North America");
  }
  if (continent === "EU") {
    return getDecision("strata", "continent = Europe");
  }
  if (continent === "AS") {
    return getDecision("constellation", "continent = Asia");
  }

  if (tz.startsWith("America/")) {
    return getDecision("orbits", `timezone ${tz} (America/*)`);
  }

  if (tz.startsWith("Europe/")) {
    return getDecision("strata", `timezone ${tz} (Europe/*)`);
  }

  if (isMobile) {
    return getDecision("bubbles", "mobile device");
  }

  const styles: StyleId[] = [
    "orbits", "strata", "constellation", "bubbles", "waves", "supershape", "isogrid", "crystal"];
  const index = numericSeed % styles.length;
  return getDecision(styles[index], 
    `fallback: seed % ${styles.length} = ${index} => ${styles[index]}`);
}

export function chooseStyleFromFingerprint(traits: UserTraits): StyleDecision {
  const allStyleIds = DEMO_SAFE_STYLE_IDS.filter((styleId) => STYLES[styleId]);
  const signals = getStyleSignals(traits);
  const ranked = allStyleIds
    .map((styleId) => {
      const score = signals.reduce((sum, signal) => {
        const hashInput = [
          STYLE_SELECTION_VERSION,
          styleId,
          signal.label,
          signal.value,
        ].join("|");

        return sum + hashToUnitInterval(hashInput) * signal.weight;
      }, 0);

      return { styleId, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.styleId.localeCompare(b.styleId);
    });

  const winner = ranked[0];
  const runnerUp = ranked[1];
  const signalSummary = signals
    .filter((signal) => signal.weight >= 1)
    .map((signal) => signal.label)
    .join("+");

  return {
    id: winner.styleId,
    reason:
      `demo-safe weighted fingerprint score (${signalSummary}) >> ` +
      `${winner.styleId} ${winner.score.toFixed(3)}` +
      (runnerUp
        ? `, runner-up ${runnerUp.styleId} ${runnerUp.score.toFixed(3)}`
        : ""),
  };
}
