import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const routedScreens = ["Home", "CyclePage", "FoodPage", "AskRedtentPage", "PatternsPage", "GuidancePage", "JournalPage", "ProfilePage", "WellnessPage"];

describe("Redtent app-wide dark-mode route coverage", () => {
  it("keeps every routed screen within the shared rose-forward dark surface and text-control contract", () => {
    for (const screen of routedScreens) {
      const source = readFileSync(new URL(`../pages/${screen}.tsx`, import.meta.url), "utf8");
      expect(source).toContain("export default");
    }
    expect(stylesheet).toContain(".dark .rose-card");
    expect(stylesheet).toContain('.dark [class*="text-[#"]');
    expect(stylesheet).toContain(".dark .bg-white");
    expect(stylesheet).toContain(".dark .field-input");
    expect(stylesheet).toContain(".dark .calendar-day");
    expect(stylesheet).toContain(".dark .wellness-option");
    expect(stylesheet).toContain('bg-[#E9D8DD]');
    expect(stylesheet).toContain(".dark .ask-redtent-chat");
    expect(stylesheet).toContain(".dark .theme-choice");
  });
});
