/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("streamdown", () => ({ Streamdown: () => null }));

import { SavedConversationLibrary } from "./JournalPage";

describe("SavedConversationLibrary recovery", () => {
  it("explains a conversation-library retrieval failure and offers a retry action", () => {
    const retry = vi.fn();
    render(<SavedConversationLibrary conversations={[]} hasError={true} onOpen={vi.fn()} onDelete={vi.fn()} onRetry={retry} />);
    expect(screen.getByRole("alert").textContent).toContain("Your saved conversations are not loading right now.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
