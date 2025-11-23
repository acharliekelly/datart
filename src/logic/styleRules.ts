// /src/logic/styleRules.ts

import type { StyleId, UserTraits } from "./types";

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
    return getDecision("orbits", "continent = NA");
  }
  if (continent === "EU") {
    return getDecision("strata", "continent = EU");
  }
  if (continent === "AS") {
    return getDecision("constellation", "continent = AS");
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

  const styles: StyleId[] = ["orbits", "strata", "constellation", "bubbles"];
  const index = numericSeed % styles.length;
  return getDecision(styles[index], 
    `fallback: seed % ${styles.length} = ${index} => ${styles[index]}`);
}
