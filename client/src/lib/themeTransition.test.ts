import { describe, expect, it } from "vitest";
import { runThemeTransition, shouldAnimateThemeTransition } from "./themeTransition";

describe("theme transition motion", () => {
  it("animates only between different resolved themes", () => {
    expect(shouldAnimateThemeTransition(null, "dark", false)).toBe(false);
    expect(shouldAnimateThemeTransition("light", "light", false)).toBe(false);
    expect(shouldAnimateThemeTransition("light", "dark", false)).toBe(true);
  });

  it("does not animate when the user prefers reduced motion", () => {
    expect(shouldAnimateThemeTransition("dark", "light", true)).toBe(false);
  });

  it("applies the live theme change inside a temporary transition state", () => {
    const classes = new Set<string>();
    const frames: Array<() => void> = [];
    const timeouts: Array<() => void> = [];
    const applied: string[] = [];
    runThemeTransition({
      root: { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } },
      previousTheme: "light",
      nextTheme: "dark",
      prefersReducedMotion: false,
      applyTheme: () => applied.push("dark"),
      requestFrame: callback => { frames.push(callback); return 1; },
      cancelFrame: () => undefined,
      scheduleTimeout: callback => { timeouts.push(callback); return 2; },
      clearScheduledTimeout: () => undefined,
    });
    expect(classes.has("theme-transitioning")).toBe(true);
    expect(applied).toEqual([]);
    frames[0]();
    expect(applied).toEqual(["dark"]);
    timeouts[0]();
    expect(classes.has("theme-transitioning")).toBe(false);
  });

  it("applies immediately without a transition state for reduced motion", () => {
    const classes = new Set<string>();
    const applied: string[] = [];
    runThemeTransition({
      root: { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } },
      previousTheme: "light",
      nextTheme: "dark",
      prefersReducedMotion: true,
      applyTheme: () => applied.push("dark"),
      requestFrame: () => 1,
      cancelFrame: () => undefined,
      scheduleTimeout: () => 2,
      clearScheduledTimeout: () => undefined,
    });
    expect(applied).toEqual(["dark"]);
    expect(classes.has("theme-transitioning")).toBe(false);
  });
});
