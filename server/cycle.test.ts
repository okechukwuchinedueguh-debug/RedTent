import { describe, expect, it } from "vitest";
import type { CycleLog } from "../drizzle/schema";
import { getCalendarMarks, getCycleSummary, getPhaseForCycleDay } from "./cycle";

const log = (start: string, end?: string): CycleLog => ({
  id: Math.floor(Math.random() * 1000),
  userId: 7,
  startAt: new Date(`${start}T00:00:00.000Z`),
  endAt: end ? new Date(`${end}T00:00:00.000Z`) : null,
  flow: "medium",
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("cycle calculations", () => {
  it("derives an estimated cycle summary from valid historical starts", () => {
    const logs = [log("2026-01-01", "2026-01-05"), log("2026-01-29", "2026-02-02"), log("2026-02-26", "2026-03-02")];
    const summary = getCycleSummary(logs, new Date("2026-03-05T12:00:00.000Z"));
    expect(summary.cycleDay).toBe(8);
    expect(summary.averageCycleLength).toBe(28);
    expect(summary.medianCycleLength).toBe(28);
    expect(summary.phase).toBe("follicular");
    expect(summary.nextPeriodAt?.toISOString().slice(0, 10)).toBe("2026-03-26");
  });

  it("uses the expected phase boundaries for a typical 28-day cycle", () => {
    expect(getPhaseForCycleDay(3, 28, 5)).toBe("menstrual");
    expect(getPhaseForCycleDay(12, 28, 5)).toBe("follicular");
    expect(getPhaseForCycleDay(14, 28, 5)).toBe("ovulation");
    expect(getPhaseForCycleDay(25, 28, 5)).toBe("luteal");
  });

  it("marks historical period dates separately from future estimates", () => {
    const marks = getCalendarMarks([log("2026-03-01", "2026-03-05")], new Date("2026-03-01"), new Date("2026-03-31"), { cycleLength: 28, periodLength: 5 }, new Date("2026-03-10"));
    const logged = marks.find(mark => mark.date.toISOString().startsWith("2026-03-03"));
    const predicted = marks.find(mark => mark.date.toISOString().startsWith("2026-03-29"));
    expect(logged).toMatchObject({ isLoggedPeriod: true, isPredictedPeriod: false, phase: "menstrual" });
    expect(predicted).toMatchObject({ isLoggedPeriod: false, isPredictedPeriod: true, phase: "menstrual" });
  });
});
