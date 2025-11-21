
/* ===========================================
 *  TYPES
 * ===========================================
 */

export type Mode = "auto" | "manual";

import type { StyleId as RegisteredStyleId } from "../components/art/styleRegistry";
export type StyleId = RegisteredStyleId;

export interface OrbitsOptions {
  ringCount: number;  // base number of rings
  jitter: number; // how far from center rings can drift (px)
}

export interface BubblesOptions {
  bubbleCount: number;  // approx # of bubbles
  spread: number; // radius from center (px)
}

export interface StrataOptions {
  bandCount: number;
  maxTilt: number;  // degrees
}

export interface ConstellationOptions {
  pointCount: number;
  connectionChance: number; // 0-1
}

export interface AllStyleOptions {
  orbits: OrbitsOptions;
  bubbles: BubblesOptions;
  strata: StrataOptions;
  constellation: ConstellationOptions;
};

export interface BaseArtProps {
  seed: number;
  palette: string[];
  options?: unknown;
}

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