/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: true, user: null, logout: vi.fn() }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: { profile: { get: { useQuery: () => ({ data: null }) } } },
}));

vi.mock("wouter", () => ({ useLocation: () => ["/", vi.fn()] }));
vi.mock("./OnboardingFlow", () => ({ default: () => null }));

import DashboardLayout from "./DashboardLayout";

it("shows the R-to-Redtent loading sequence while authentication is loading", () => {
  render(<DashboardLayout><p>Hidden application content</p></DashboardLayout>);
  expect(screen.getByRole("status", { name: "Loading Redtent" })).toBeTruthy();
  expect(screen.getByText("Making space for your story")).toBeTruthy();
});
