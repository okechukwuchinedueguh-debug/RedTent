import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Redtent dark-theme contrast contract", () => {
  it("keeps calendar, onboarding, navigation, and quick-action surfaces readable in a rose-forward dark palette", () => {
    expect(stylesheet).toContain(".dark .calendar-day");
    expect(stylesheet).toContain("background: #d88897 !important; color: #3b242c !important;");
    expect(stylesheet).toContain(".dark .calendar-status");
    expect(stylesheet).toContain(".dark .onboarding-surface");
    expect(stylesheet).toContain(".dark .onboarding-choice");
    expect(stylesheet).toContain(".dark .app-mobile-navigation");
    expect(stylesheet).toContain("bg-[#F7E7E3]");
    expect(stylesheet).toContain("background: #784452 !important");
    expect(stylesheet).toContain(".dark .ask-redtent-context label");
    expect(stylesheet).toContain("linear-gradient(152deg, #7b4655 0%, #6d4050 54%, #5a3945 90%, #30242a 100%)");
    expect(stylesheet).toContain(".dark .redtent-loader");
    expect(stylesheet).toContain(".dark .ask-redtent-chat-header");
    expect(stylesheet).toContain("background: #90505f !important");
    expect(stylesheet).toContain(".dark .ask-redtent-context label");
    expect(stylesheet).toContain(".dark .wellness-date-control");
    expect(stylesheet).toContain(".dark .wellness-option");
    expect(stylesheet).toContain(".dark .bg-white");
    expect(stylesheet).toContain("bg-[#E9D8DD]");
    expect(stylesheet).toContain(".dark .global-theme-toggle");
    expect(stylesheet).toContain(".dark .global-theme-toggle__option.active");
    expect(stylesheet).toContain(".dark .phase-pill, .dark .signal-badge, .dark .trend-badge, .dark .confidence-badge");
  });
});
