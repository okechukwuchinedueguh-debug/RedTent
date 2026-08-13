/** @vitest-environment jsdom */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const { replaceLocation } = vi.hoisted(() => ({ replaceLocation: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      cycles: { summary: { invalidate: vi.fn() }, calendar: { invalidate: vi.fn() } },
      dashboard: { overview: { invalidate: vi.fn() } },
    }),
    cycles: {
      summary: { useQuery: () => ({ isLoading: false, error: null, data: { summary: { cycleDay: 12, phase: "follicular", averageCycleLength: 28, medianCycleLength: 28, variation: 0, confidence: "building" }, logs: [] } }) },
      calendar: { useQuery: () => ({ isLoading: false, error: null, data: [{ date: new Date(2026, 7, 1), cycleDay: 12, phase: "follicular", isLoggedPeriod: false, isPredictedPeriod: false }] }) },
      create: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      delete: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
    },
  },
}));

vi.mock("wouter", () => ({ useLocation: () => ["/cycle?log=period", replaceLocation] }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import CyclePage from "./CyclePage";

beforeEach(() => vi.clearAllMocks());

it("opens CyclePage’s period-entry sheet from the deep link and clears the route trigger", async () => {
  render(<CyclePage />);

  expect(await screen.findByRole("heading", { name: "When did this period begin?" })).toBeTruthy();
  await waitFor(() => expect(replaceLocation).toHaveBeenCalledWith("/cycle", { replace: true }));
});
