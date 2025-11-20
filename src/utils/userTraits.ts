import type { 
  UserTraits, 
  IpInfo, 
  IpApiResponse,
  StyleId, 
  GenerationState,
GenerationOptions } from "./types";

/* ===========================================
 *  USER TRAITS / FINGERPRINT
 * ===========================================
 */

export function getBaseTraits(): UserTraits {
  if (typeof window === "undefined") {
    return {
      timeZone: "UTC",
      userAgent: "unknown",
      language: "en-US",
      screenWidth: 0,
      screenHeight: 0,
      devicePixelRatio: 1,
      darkMode: false,
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

  return {
    timeZone: tz,
    userAgent: ua,
    language: lang,
    screenWidth: w,
    screenHeight: h,
    devicePixelRatio: dpr,
    darkMode,
  };
}

export function buildFingerprint(traits: UserTraits): string {
  const parts: (string | number | boolean | undefined)[] = [
    traits.userAgent,
    traits.language,
    traits.timeZone,
    traits.screenWidth,
    traits.screenHeight,
    traits.devicePixelRatio,
    traits.darkMode ? "dark" : "light",
  ];

  if (traits.ipInfo) {
    parts.push(
      traits.ipInfo.ip,
      traits.ipInfo.country,
      traits.ipInfo.region,
      traits.ipInfo.city,
      traits.ipInfo.continentCode
    );
  }

  return parts.map((p) => String(p ?? "")).join("|");
}

/* ===========================================
 *  RANDOM + HASH UTILS
 * ===========================================
 */

export function hashStringToInt(str: string, max = 1_000_000): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % max;
}

export function makeRng(seed: number): () => number {
  return function next() {
    // simple linear congruential generator (LCG)
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/* ===========================================
 *  IP LOOKUP (CLIENT-SIDE ONLY)
 * ===========================================
 */

export async function fetchIpInfo(): Promise<IpInfo | null> {
  // 1. check cache first
  const cached = localStorage.getItem("datart:ipInfo");
  if (cached) {
    try {
      const ipInfo: IpInfo = JSON.parse(cached);
      return ipInfo;
    } catch {
      // corrupted / outdated, ignore
    }
  }

  // 2. Fetch from API
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;

    const data: IpApiResponse = await res.json();

    const ipInfo: IpInfo = {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      continentCode: data.continent_code,
    };

    return ipInfo;
  } catch (err) {
    console.error("IP fetch failed:", err);
    return null;
  }
}

/* ===========================================
 *  PALETTE + STYLE SELECTION
 * ===========================================
 */

export function generatePalette(rng: () => number): string[] {
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

/**
 * Given traits (browser + optional IP), compute:
 * - fingerprint
 * - seed
 * - palette
 * - styleId
 */
export function buildGenerationState(
  traits: UserTraits,
  options: GenerationOptions
): GenerationState {
  const fingerprint = buildFingerprint(traits);
  const baseSeed = hashStringToInt(fingerprint);
  const effectiveSeed = 
    options.mode === "manual" && options.manualSeed != null
      ? options.manualSeed
      : baseSeed;
  const rngForPalette = makeRng(effectiveSeed);
  const palette = generatePalette(rngForPalette);
  const autoStyle = chooseStyle(traits, effectiveSeed);
  const effectiveStyle: StyleId =
    options.mode === "manual" && options.manualStyle
      ? options.manualStyle
      : autoStyle;

  return {
    traits,
    fingerprint,
    seed: effectiveSeed,
    palette,
    styleId: effectiveStyle,
  };
}
