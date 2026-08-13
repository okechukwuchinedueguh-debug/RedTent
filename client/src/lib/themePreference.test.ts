import { describe, expect, it } from "vitest";
import { DEFAULT_THEME_PREFERENCE, nextThemeTransition, resolveThemePreference } from "./themePreference";

describe("Redtent theme preferences", () => {
  it("defaults first-time Redtent users to the light appearance", () => {
    expect(DEFAULT_THEME_PREFERENCE).toBe("light");
  });

  it("honors explicit light and dark choices", () => {
    const night = new Date("2026-08-13T22:00:00");
    expect(resolveThemePreference("light", night)).toBe("light");
    expect(resolveThemePreference("dark", night)).toBe("dark");
  });

  it("uses local day and night boundaries for automatic mode", () => {
    expect(resolveThemePreference("auto", new Date("2026-08-13T06:59:00"))).toBe("dark");
    expect(resolveThemePreference("auto", new Date("2026-08-13T07:00:00"))).toBe("light");
    expect(resolveThemePreference("auto", new Date("2026-08-13T18:59:00"))).toBe("light");
    expect(resolveThemePreference("auto", new Date("2026-08-13T19:00:00"))).toBe("dark");
    expect(nextThemeTransition("auto", new Date("2026-08-13T18:30:00"))).toEqual(new Date("2026-08-13T19:00:00"));
  });
});
