// /src/logic/styleRules.ts

import { STYLES } from "../components/art/styleRegistry";
import type { StyleId, UserTraits } from "./types";

const IP_BUCKET_STYLES: StyleId[] = [
  "orbits",
  "strata",
  "bubbles",
  "waves",
  "fern",
  "crystal",
  "tree"
];

const BROWSER_STYLES: Record<string, StyleId> = {
  chrome: "isogrid",
  edge: "koch",
  firefox: "flowfield",
  safari: "nebula",
  opera: "aurora"
};

const CONTINENT_STYLES: Record<string, StyleId> = {
  "NA": "orbits",
  "SA": "stata",
  "EU": "lattice",
  "AF": "nebula",
  "AS": "aurora",
  "OC": "bubbles",
};

const LANGUAGE_STYLES: Record<string, StyleId> = {
  "en": "orbits",
  "es": "strata",
  "fr": "constellation",
  "de": "lattice",
  "ja": "waves",
  "ko": "crystal",
};

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
  const reasons: string[] = [];

  // 1) IP bucket
  if (traits.ipInfo?.ip) {
    const hash = simpleHash(traits.ipInfo.ip);
    const bucketIdx = hash % IP_BUCKET_STYLES.length;
    const style = IP_BUCKET_STYLES[bucketIdx];

    reasons.push(
      `IP bucket: hash(${traits.ipInfo.ip}) >> bucket ${bucketIdx} >> ${style}`
    );

    return {
      id: style,
      reason: reasons.join(" | "),
    };
  }

  // 2) Browser family
  const family = getBrowserFamily(traits.userAgent);
  if (family && BROWSER_STYLES[family]) {
    const style = BROWSER_STYLES[family];
    reasons.push(`Browser: ${family} >> ${style}`);

    return {
      id: style,
      reason: reasons.join(" | "),
    };
  }

  // 3) Continent (fallback)
  if (traits.ipInfo?.continentCode && CONTINENT_STYLES[traits.ipInfo.continentCode]) {
    const style = CONTINENT_STYLES[traits.ipInfo.continentCode];
    reasons.push(`Continent: ${traits.ipInfo.continentCode} >> ${style}`);

    return {
      id: style,
      reason: reasons.join(" | "),
    };
  }

  // 4) Language
  if (traits.language) {
    const lang = traits.language.split("-")[0].toLocaleLowerCase();
    if (LANGUAGE_STYLES[lang]) {
      const style = LANGUAGE_STYLES[lang];
      reasons.push(`Language: ${lang} >> ${style}`);
      return {
        id: style,
        reason: reasons.join(" | "),
      };
    }
  }

  // Ultimate fallback: hash entire fingerprint
  const fingerprintString = JSON.stringify(traits);
  const hash = simpleHash(fingerprintString);
  const allStyleIds = Object.keys(STYLES) as StyleId[];
  const idx = hash % allStyleIds.length;
  const style = allStyleIds[idx];

  reasons.push(`Fallback: hash(fingerprint) >> ${style}`);

  return {
    id: style,
    reason: reasons.join(" | "),
  };
}