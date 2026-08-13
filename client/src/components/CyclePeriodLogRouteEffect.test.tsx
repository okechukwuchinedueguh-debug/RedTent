/** @vitest-environment jsdom */
import React, { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { PERIOD_LOG_ACTION_PATH } from "@/lib/periodLogAction";
import { CyclePeriodLogRouteEffect } from "./CyclePeriodLogRouteEffect";

function Harness() {
  const [location, setLocation] = useState(PERIOD_LOG_ACTION_PATH);
  const [sheetOpen, setSheetOpen] = useState(false);
  return <><CyclePeriodLogRouteEffect location={location} openSheet={() => setSheetOpen(true)} replaceLocation={setLocation} /><output data-testid="route">{location}</output><output data-testid="sheet">{String(sheetOpen)}</output></>;
}

it("opens the rendered Cycle period-entry effect and replaces the deep-link route", async () => {
  render(<Harness />);
  await waitFor(() => {
    expect(screen.getByTestId("sheet").textContent).toBe("true");
    expect(screen.getByTestId("route").textContent).toBe("/cycle");
  });
});
