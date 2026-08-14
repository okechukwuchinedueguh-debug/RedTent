import { describe, expect, it } from "vitest";
import { buildTrendExportCsv } from "./trendExport";

describe("Redtent private trend export", () => {
  it("formats only the user’s provided trend summary into an escaped CSV report", () => {
    const csv = buildTrendExportCsv({ sample: { cyclesTracked: 3, checkIns: 8, reflections: 2 }, timing: { averageLength: 28, shortestLength: 27, longestLength: 29, variation: 2, intervalsTracked: 2 }, coverage: { cyclesWithCheckIns: 2, cyclesWithReflections: 1 }, moodCounts: [{ label: "good", count: 4 }], energyCounts: [{ label: "medium", count: 5 }], topSignals: [{ label: "bloating", count: 2 }], recentCycles: [{ startAt: new Date("2026-08-01T00:00:00.000Z"), length: 28, checkIns: 3, reflectionCount: 1 }], recentReflections: [{ moment: "premenstrual", whatHelped: "Tea, rest, and a walk", entryAt: new Date("2026-08-24T00:00:00.000Z") }], note: "Your entries are private." }, new Date("2026-08-25T00:00:00.000Z"));
    expect(csv).toContain('"Redtent personal trends export"');
    expect(csv).toContain('"Tea, rest, and a walk"');
    expect(csv).toContain('"Logged timing range (days)","2"');
    expect(csv).not.toContain("partner");
  });
});
