// @vitest-environment jsdom

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { axe } from "jest-axe";
import App from "../src/App";

const IP_CACHE_KEY = "datart:ipInfo";
const reactActGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActGlobal.IS_REACT_ACT_ENVIRONMENT = true;

function mockMatchMedia(width: number) {
  return vi.fn((query: string) => {
    const maxWidth = query.match(/max-width:\s*(\d+)px/);
    const minWidth = query.match(/min-width:\s*(\d+)px/);
    const reducedMotion = query.includes("prefers-reduced-motion");
    const matches =
      (maxWidth ? width <= Number(maxWidth[1]) : false) ||
      (minWidth ? width >= Number(minWidth[1]) : false) ||
      (reducedMotion ? false : false);

    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

async function renderApp(width = 1024): Promise<Root> {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  window.matchMedia = mockMatchMedia(width);
  window.localStorage.setItem(
    IP_CACHE_KEY,
    JSON.stringify({
      ip: "198.51.100.88",
      city: "Example City",
      region: "Example Region",
      country: "Example Country",
      continentCode: "NA",
    })
  );

  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);

  await act(async () => {
    root.render(<App />);
  });

  return root;
}

async function clickByControlsId(id: string) {
  const button = document.querySelector<HTMLButtonElement>(
    `button[aria-controls="${id}"]`
  );

  expect(button).not.toBeNull();

  await act(async () => {
    button?.click();
  });
}

describe("automated accessibility checks", () => {
  let root: Root | null = null;

  beforeEach(() => {
    document.body.innerHTML = "";
    window.localStorage.clear();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }
    root = null;
    vi.unstubAllGlobals();
  });

  it("has no axe violations in the default desktop shell", async () => {
    root = await renderApp();

    const results = await axe(document.body);

    expect(results.violations).toEqual([]);
  });

  it("has no axe violations with desktop control and explanation panels open", async () => {
    root = await renderApp();

    await clickByControlsId("datart-controls-panel");
    await clickByControlsId("datart-debug-panel");

    const results = await axe(document.body);

    expect(results.violations).toEqual([]);
  });

  it("has no axe violations in the mobile shell", async () => {
    root = await renderApp(390);

    const results = await axe(document.body);

    expect(results.violations).toEqual([]);
  });
});
