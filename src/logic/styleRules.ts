// /src/logic/styleRules.ts

import type { StyleId, UserTraits } from "./types";


export function chooseStyle(traits: UserTraits, numericSeed: number): StyleId {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(traits.userAgent);
  const continent = traits.ipInfo?.continentCode ?? "";

  // continent-first mapping, then time zone, then fallback
  if (continent === "NA") return "orbits";
  if (continent === "EU") return "strata";
  if (continent === "AS") return "constellation";

  if (traits.timeZone.startsWith("America/")) return "orbits";
  if (traits.timeZone.startsWith("Europe/")) return "strata";
  if (isMobile) return "constellation";

  const styles: StyleId[] = ["orbits", "strata", "constellation"];
  return styles[numericSeed % styles.length];
}
