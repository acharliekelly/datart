import { describe, expect, it } from "vitest";
import { STYLES } from "../../src/components/art/styleRegistry";
import { chooseStyleFromFingerprint } from "../../src/logic/styleRules";
import type { UserTraits } from "../../src/logic/types";

const registeredStyleIds = Object.keys(STYLES);
const demoSafeStyleIds = [
  "orbits",
  "strata",
  "constellation",
  "bubbles",
  "waves",
  "supershape",
  "isogrid",
  "crystal",
  "lattice",
  "nebula",
  "aurora",
  "koch",
  "tree",
  "flowfield",
];

function makeTraits(overrides: Partial<UserTraits> = {}): UserTraits {
  return {
    timeZone: "UTC",
    userAgent: "unknown",
    language: "zz-ZZ",
    screenWidth: 1280,
    screenHeight: 720,
    devicePixelRatio: 1,
    darkMode: false,
    ...overrides,
  };
}

describe("chooseStyleFromFingerprint", () => {
  it("always returns a registered style for representative trait sets", () => {
    const examples: UserTraits[] = [
      makeTraits({
        ipInfo: { ip: "198.51.100.10", continentCode: "NA" },
      }),
      makeTraits({
        ipInfo: { ip: "", continentCode: "SA" },
      }),
      makeTraits({
        userAgent:
          "Mozilla/5.0 AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      }),
      makeTraits({
        userAgent: "Mozilla/5.0 Firefox/121.0",
      }),
      makeTraits({
        userAgent: "Mozilla/5.0 Version/17.0 Safari/605.1.15",
      }),
      makeTraits({
        language: "fr-CA",
      }),
      makeTraits({
        timeZone: "Pacific/Auckland",
        language: "",
      }),
    ];

    for (const traits of examples) {
      const decision = chooseStyleFromFingerprint(traits);
      expect(registeredStyleIds).toContain(decision.id);
      expect(demoSafeStyleIds).toContain(decision.id);
      expect(decision.reason).toContain(decision.id);
    }
  });

  it("is stable for the same trait set", () => {
    const traits = makeTraits({
      timeZone: "America/Chicago",
      language: "es-US",
      userAgent:
        "Mozilla/5.0 AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      screenWidth: 1920,
      screenHeight: 1080,
      devicePixelRatio: 1,
      darkMode: true,
      ipInfo: {
        ip: "198.51.100.44",
        city: "Example City",
        region: "Example Region",
        country: "Example Country",
        continentCode: "SA",
      },
    });

    expect(chooseStyleFromFingerprint(traits)).toEqual(
      chooseStyleFromFingerprint(traits)
    );
  });

  it("spreads common visitor trait combinations across many styles", () => {
    const browsers = [
      "Mozilla/5.0 AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      "Mozilla/5.0 Edg/120.0",
      "Mozilla/5.0 Firefox/121.0",
      "Mozilla/5.0 Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 OPR/106.0",
    ];
    const timeZones = [
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Australia/Sydney",
    ];
    const languages = ["en-US", "es-MX", "fr-CA", "de-DE"];
    const screens = [
      { screenWidth: 390, screenHeight: 844, devicePixelRatio: 3 },
      { screenWidth: 1366, screenHeight: 768, devicePixelRatio: 1 },
      { screenWidth: 1920, screenHeight: 1080, devicePixelRatio: 2 },
    ];

    const counts = new Map<string, number>();

    for (const userAgent of browsers) {
      for (const timeZone of timeZones) {
        for (const language of languages) {
          for (const screen of screens) {
            const decision = chooseStyleFromFingerprint(
              makeTraits({
                userAgent,
                timeZone,
                language,
                ...screen,
              })
            );
            counts.set(decision.id, (counts.get(decision.id) ?? 0) + 1);
          }
        }
      }
    }

    const mostCommonCount = Math.max(...counts.values());
    const totalCount = browsers.length * timeZones.length * languages.length * screens.length;

    expect(counts.size).toBeGreaterThanOrEqual(10);
    expect(mostCommonCount / totalCount).toBeLessThan(0.24);
  });
});
