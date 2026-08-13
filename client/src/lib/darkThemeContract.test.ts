import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Redtent dark-theme contrast contract", () => {
  it("keeps calendar, onboarding, navigation, and quick-action surfaces readable in a rose-forward dark palette", () => {
    expect(stylesheet).toContain(".dark .calendar-day");
    expect(stylesheet).toContain(".dark .calendar-status");
    expect(stylesheet).toContain(".dark .onboarding-surface");
    expect(stylesheet).toContain(".dark .onboarding-choice");
    expect(stylesheet).toContain(".dark .app-mobile-navigation");
    expect(stylesheet).toContain("bg-[#F7E7E3]");
    expect(stylesheet).toContain("background: #5b3743 !important");
    expect(stylesheet).toContain("background: #51313b !important");
    expect(stylesheet).toContain("linear-gradient(150deg, #593641 0%, #462d38 58%, #2d2027 100%)");
  });
});
