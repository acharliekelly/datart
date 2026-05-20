import { describe, expect, it } from "vitest";
import { STYLES } from "../../src/components/art/styleRegistry";
import { chooseStyleFromFingerprint } from "../../src/logic/styleRules";
import type { UserTraits } from "../../src/logic/types";

const registeredStyleIds = Object.keys(STYLES);

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
        ipInfo: { continentCode: "SA" },
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
      expect(decision.reason).toContain(decision.id);
    }
  });

  it("keeps the South America fallback mapped to the registered strata style", () => {
    const decision = chooseStyleFromFingerprint(
      makeTraits({
        ipInfo: { continentCode: "SA" },
      })
    );

    expect(decision.id).toBe("strata");
  });
});
