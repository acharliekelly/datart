
/* ===========================================
 *  TYPES
 * ===========================================
 */

export type StyleId = "orbits" | "strata" | "constellation";

export interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  continentCode?: string; // e.g. "NA", "EU", "AS"
}

export interface UserTraits {
  timeZone: string;
  userAgent: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  darkMode: boolean;
  ipInfo?: IpInfo;
}

export interface ArtStyleProps {
  seed: number;
  palette: string[];
}

export interface GenerationState {
  traits: UserTraits;
  fingerprint: string;
  seed: number;
  palette: string[];
  styleId: StyleId;
}