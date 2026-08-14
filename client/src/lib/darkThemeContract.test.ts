import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Redtent dark-theme contrast contract", () => {
  it("keeps calendar, onboarding, navigation, safety, and quick-action surfaces readable on a deep-wine foundation", () => {
    expect(stylesheet).toContain(".dark .calendar-day");
    expect(stylesheet).toContain("background: #4a0d20 !important; color: #fff1ec !important;");
    expect(stylesheet).toContain(".dark .calendar-status");
    expect(stylesheet).toContain(".dark .onboarding-surface");
    expect(stylesheet).toContain(".dark .onboarding-choice");
    expect(stylesheet).toContain(".dark .app-mobile-navigation");
    expect(stylesheet).toContain(".dark .nav-mobile-item.active { background: #8d1734; color: #fffaf7;");
    expect(stylesheet).toContain("html.dark[data-accent-intensity] .nav-mobile-item.active");
    expect(stylesheet).toContain("html.dark.high-contrast .nav-mobile-item.active");
    expect(stylesheet).toContain("bg-[#F7E7E3]");
    expect(stylesheet).toContain("background-color: #501226 !important");
    expect(stylesheet).toContain(".dark .ask-redtent-context label");
    expect(stylesheet).toContain("linear-gradient(148deg, #250710 0%, #410b1a 54%, #260811 100%)");
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
    expect(stylesheet).toContain(".dark .care-category");
    expect(stylesheet).toContain(".dark .care-safety");
    expect(stylesheet).toContain(".dark .redtent-safety-callout");
    expect(stylesheet).toContain(".dark .phase-pill, .dark .signal-badge, .dark .trend-badge, .dark .confidence-badge");
    expect(stylesheet).toContain("html.high-contrast");
    expect(stylesheet).toContain("html.dark.high-contrast");
    expect(stylesheet).toContain("top: calc(max(0.75rem, env(safe-area-inset-top)) + 4.75rem)");
    expect(stylesheet).toContain("html[data-accent-intensity=\"bold\"]");
  });
});
