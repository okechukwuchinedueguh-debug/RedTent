import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../components/DashboardLayout.tsx", import.meta.url), "utf8");

describe("mobile navigation hosting-overlay clearance", () => {
  it("lifts the navigation above the hosting badge and reserves scrollable content clearance", () => {
    expect(stylesheet).toContain(".app-mobile-navigation { bottom: max(4.75rem, calc(env(safe-area-inset-bottom) + 4rem)); }");
    expect(layout).toContain("min-h-screen pb-40");
    expect(layout).toContain("app-mobile-navigation fixed inset-x-0");
    expect(layout).not.toContain("app-mobile-navigation fixed inset-x-0 bottom-0");
  });
});
