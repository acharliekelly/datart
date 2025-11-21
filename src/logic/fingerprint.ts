import type { 
  UserTraits, 
  IpInfo
} from "./types";


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

export function applyIpInfo(
  traits: UserTraits,
  ipInfo: IpInfo
) : UserTraits {
  return { ...traits, ipInfo };
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

