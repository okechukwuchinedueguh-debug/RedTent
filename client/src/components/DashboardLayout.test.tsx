/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { PERIOD_LOG_ACTION_PATH } from "@/lib/periodLogAction";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
  render(<ThemeProvider><DashboardLayout><p>Today’s cycle overview</p></DashboardLayout></ThemeProvider>);

  await user.click(screen.getByRole("button", { name: "Log a new period" }));
  expect(navigate).toHaveBeenCalledWith(PERIOD_LOG_ACTION_PATH);
});

it("shows the global Light and Dark appearance control in the authenticated shell", () => {
  render(<ThemeProvider><DashboardLayout><p>Today’s cycle overview</p></DashboardLayout></ThemeProvider>);

  expect(screen.getAllByRole("group", { name: "Choose light or dark appearance" }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("button", { name: /light/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("button", { name: /dark/i }).length).toBeGreaterThan(0);
});
