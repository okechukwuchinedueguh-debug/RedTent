import { describe, expect, it } from "vitest";
import type { CycleLog, CycleMomentReflection, FoodEntry, WellnessEntry } from "../drizzle/schema";
import { buildCycleTrendDashboard, buildPatternObservations, buildTomorrowBriefing } from "./patterns";

const cycleLog = (startAt: string): CycleLog => ({ id: 1, userId: 7, startAt: new Date(startAt), endAt: null, flow: null, notes: null, createdAt: new Date(), updatedAt: new Date() });
const wellnessEntry = (entryAt: string, energy: WellnessEntry["energy"], symptoms: string): WellnessEntry => ({ id: 1, userId: 7, entryAt: new Date(entryAt), mood: "okay", energy, symptoms, sleepQuality: "fair", notes: null, createdAt: new Date(), updatedAt: new Date() });
const foodEntry = (): FoodEntry => ({ id: 1, userId: 7, imageKey: "redtent/7/food/meal.jpg", imageUrl: "https://example.com/meal.jpg", phase: "luteal", lensMode: "after", userNotes: null, analysisJson: "{}", createdAt: new Date() });
const reflection = (): CycleMomentReflection => ({ id: 1, userId: 7, moment: "premenstrual", cycleStartAt: new Date("2026-08-01T12:00:00Z"), whatHelped: "I kept an easier evening.", entryAt: new Date("2026-08-24T12:00:00Z"), createdAt: new Date(), updatedAt: new Date() });

describe("Redtent pattern observations", () => {
  it("returns cautious observations sourced only from logged data", () => {
    const patterns = buildPatternObservations({
      logs: [cycleLog("2026-08-01T12:00:00Z"), cycleLog("2026-07-04T12:00:00Z")],
      wellness: [wellnessEntry("2026-08-07T12:00:00Z", "low", JSON.stringify(["Bloating"])), wellnessEntry("2026-08-08T12:00:00Z", "low", JSON.stringify(["Bloating"]))],
      food: [foodEntry(), foodEntry(), foodEntry()],
      cycleLength: 28,
      periodLength: 5,
    });

    expect(patterns.some(pattern => pattern.detail.includes("not a diagnosis"))).toBe(true);
    expect(patterns.some(pattern => pattern.detail.includes("reported Bloating"))).toBe(true);
    expect(patterns.some(pattern => pattern.detail.includes("3 food snapshots"))).toBe(true);
  });

  it("does not invent observations when the user has no data", () => {
    expect(buildPatternObservations({ logs: [], wellness: [], food: [], cycleLength: 28, periodLength: 5 })).toEqual([]);
  });

  it("keeps Tomorrow as a suggestion rather than a medical prediction", () => {
    const briefing = buildTomorrowBriefing({ phase: "luteal", nextPhase: "menstrual", daysUntilNextPhase: 2, todayWellness: wellnessEntry("2026-08-12T12:00:00Z", "low", "[]"), observations: [] });
    expect(briefing.wellness).toContain("may be one option");
    expect(briefing.safety).toContain("not medical predictions");
  });

  it("builds a multi-cycle dashboard only from the user’s logged records", () => {
    const dashboard = buildCycleTrendDashboard({
      logs: [cycleLog("2026-08-01T12:00:00Z"), cycleLog("2026-07-04T12:00:00Z")],
      wellness: [wellnessEntry("2026-08-07T12:00:00Z", "low", JSON.stringify(["Bloating"])), wellnessEntry("2026-08-08T12:00:00Z", "high", JSON.stringify(["Headache"]))],
      reflections: [reflection()],
      cycleLength: 28,
    });

    expect(dashboard.sample).toEqual({ cyclesTracked: 2, checkIns: 2, reflections: 1 });
    expect(dashboard.timing).toMatchObject({ averageLength: 28, shortestLength: 28, longestLength: 28, variation: 0, intervalsTracked: 1 });
    expect(dashboard.recentCycles[0]).toMatchObject({ length: null, checkIns: 2, reflectionCount: 1 });
    expect(dashboard.topSignals).toEqual(expect.arrayContaining([{ label: "Bloating", count: 1 }]));
    expect(dashboard.recentReflections[0]?.whatHelped).toBe("I kept an easier evening.");
    expect(dashboard.note).toContain("not a diagnosis");
  });
});
