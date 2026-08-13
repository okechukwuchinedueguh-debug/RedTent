/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { PERIOD_LOG_ACTION_PATH } from "@/lib/periodLogAction";
import { MobilePeriodLogButton } from "./MobilePeriodLogButton";

it("activates the rendered central mobile Log period control", async () => {
  const navigate = vi.fn();
  const user = userEvent.setup();
  render(<MobilePeriodLogButton navigate={navigate} />);
  await user.click(screen.getByRole("button", { name: "Log a new period" }));
  expect(navigate).toHaveBeenCalledWith(PERIOD_LOG_ACTION_PATH);
});
