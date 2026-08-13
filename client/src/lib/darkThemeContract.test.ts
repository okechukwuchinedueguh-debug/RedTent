import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Redtent dark-theme contrast contract", () => {
  it("keeps calendar, onboarding, navigation, and quick-action surfaces on readable dark tokens", () => {
    expect(stylesheet).toContain(".dark .calendar-day");
    expect(stylesheet).toContain(".dark .calendar-status");
    expect(stylesheet).toContain(".dark .onboarding-surface");
    expect(stylesheet).toContain(".dark .onboarding-choice");
    expect(stylesheet).toContain(".dark .app-mobile-navigation");
    expect(stylesheet).toContain("bg-[#F7E7E3]");
  });
});
