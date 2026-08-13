import { describe, expect, it } from "vitest";
import { getPeriodForecastStatus } from "./cycleForecast";

describe("period forecast status", () => {
  const now = new Date("2026-08-13T12:00:00");

  it("describes a period expected in a few days as an estimate", () => {
    expect(getPeriodForecastStatus(new Date("2026-08-17T12:00:00"), now)).toMatchObject({ kind: "upcoming", title: "Period in 4 days", daysFromExpected: 4 });
  });

  it("uses careful non-diagnostic language for an expected period that is late", () => {
    const status = getPeriodForecastStatus(new Date("2026-08-10T12:00:00"), now);
    expect(status).toMatchObject({ kind: "late", title: "Expected 3 days ago", daysFromExpected: -3 });
    expect(status.detail).toContain("Cycle timing can shift");
    expect(status.detail).not.toContain("pregnan");
  });

  it("asks for a first date when a forecast is not available", () => {
    expect(getPeriodForecastStatus(null, now)).toMatchObject({ kind: "setup", expectedAt: null });
  });
});
