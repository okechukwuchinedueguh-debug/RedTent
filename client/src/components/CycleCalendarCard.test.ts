import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CycleCalendarCard from "./CycleCalendarCard";

describe("CycleCalendarCard", () => {
  it("renders a careful late-period status and marks the past estimate in the calendar legend", () => {
    const markup = renderToStaticMarkup(createElement(CycleCalendarCard, {
      month: new Date("2026-08-01T12:00:00"),
      marks: [],
      status: {
        kind: "late",
        title: "Expected 3 days ago",
        detail: "Cycle timing can shift. Save a date when it feels right.",
        expectedAt: new Date("2026-08-10T12:00:00"),
        daysFromExpected: -3,
      },
      onPrevious: () => undefined,
      onNext: () => undefined,
      onOpenCycle: () => undefined,
    }));
    expect(markup).toContain("Expected 3 days ago");
    expect(markup).toContain("Cycle timing can shift");
    expect(markup).toContain("Past estimate");
    expect(markup).not.toContain("Add period date</button>");
    expect(markup).toContain("calendar-status--late");
  });
});
