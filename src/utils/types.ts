
/* ===========================================
 *  TYPES
 * ===========================================
 */

export type StyleId = "orbits" | "strata" | "constellation";
export type Mode = "auto" | "manual";

export interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  continentCode?: string; // e.g. "NA", "EU", "AS"
}

export interface IpApiResponse {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  continent_code: string;
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

export interface GenerationOptions {
  mode: Mode;
  manualSeed?: number | null;
  manualStyle?: StyleId | null;
}