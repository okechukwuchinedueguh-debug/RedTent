import { describe, expect, it } from "vitest";
import { getPeriodLogRequest, openPeriodLogFromRoute, PERIOD_LOG_ACTION_PATH, startPeriodLogAction } from "./periodLogAction";

describe("period-log action deep link", () => {
  it("opens the period-entry flow request and supplies a clean Cycle path afterward", () => {
    expect(getPeriodLogRequest(PERIOD_LOG_ACTION_PATH)).toEqual({ shouldOpen: true, cleanPath: "/cycle" });
  });

  it("does not open the period-entry flow for ordinary Cycle routes", () => {
    expect(getPeriodLogRequest("/cycle")).toEqual({ shouldOpen: false, cleanPath: null });
    expect(getPeriodLogRequest("/cycle?log=other")).toEqual({ shouldOpen: false, cleanPath: null });
  });

  it("opens the Cycle entry sheet and replaces the route after consuming the deep link", () => {
    let sheetOpen = false;
    const replacements: string[] = [];
    expect(openPeriodLogFromRoute(PERIOD_LOG_ACTION_PATH, () => { sheetOpen = true; }, path => replacements.push(path))).toBe(true);
    expect(sheetOpen).toBe(true);
    expect(replacements).toEqual(["/cycle"]);
  });

  it("routes the central mobile Log period action into the entry-sheet deep link", () => {
    const navigations: string[] = [];
    startPeriodLogAction(path => navigations.push(path));
    expect(navigations).toEqual([PERIOD_LOG_ACTION_PATH]);
  });
});
