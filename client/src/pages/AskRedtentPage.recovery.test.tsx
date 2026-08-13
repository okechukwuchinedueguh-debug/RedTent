/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const navigate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ ask: { conversations: { list: { invalidate: vi.fn() }, get: { invalidate: vi.fn() } } } }),
    ask: {
      redtent: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      conversations: {
        get: { useQuery: () => ({ data: undefined, isLoading: false, error: new Error("missing") }) },
        create: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
        continue: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      },
    },
  },
}));

vi.mock("wouter", () => ({ useLocation: () => ["/ask?conversation=51", navigate] }));
vi.mock("streamdown", () => ({ Streamdown: () => null }));

import AskRedtentPage from "./AskRedtentPage";

describe("AskRedtentPage saved conversation recovery", () => {
  it("shows a clear recovery state when a private saved conversation cannot be loaded", () => {
    render(<AskRedtentPage />);
    expect(screen.getByRole("alert").textContent).toContain("We could not open it just now.");
    expect(screen.getByRole("button", { name: "Start a fresh question" })).toBeTruthy();
  });
});
