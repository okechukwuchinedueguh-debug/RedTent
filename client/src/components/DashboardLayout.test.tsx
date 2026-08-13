/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { PERIOD_LOG_ACTION_PATH } from "@/lib/periodLogAction";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false, user: { name: "Amina" }, logout: vi.fn() }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    profile: { get: { useQuery: () => ({ data: { username: "amina", profilePhotoUrl: null, onboardingCompletedAt: new Date() } }) } },
  },
}));

vi.mock("wouter", () => ({ useLocation: () => ["/", navigate] }));
vi.mock("./OnboardingFlow", () => ({ default: () => null }));

import DashboardLayout from "./DashboardLayout";

beforeEach(() => vi.clearAllMocks());

it("activates DashboardLayout’s central mobile Log period control", async () => {
  const user = userEvent.setup();
  render(<DashboardLayout><p>Today’s cycle overview</p></DashboardLayout>);

  await user.click(screen.getByRole("button", { name: "Log a new period" }));
  expect(navigate).toHaveBeenCalledWith(PERIOD_LOG_ACTION_PATH);
});
