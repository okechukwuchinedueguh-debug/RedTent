/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("streamdown", () => ({ Streamdown: () => null }));

import { ConversationLibrary } from "./JournalPage";

describe("Your Space saved Ask Redtent conversation library", () => {
  it("searches, filters, renames, and continues only the selected private conversation", () => {
    const onReview = vi.fn();
    const onContinue = vi.fn();
    const onDelete = vi.fn();
    const onRename = vi.fn();
    const conversations = [
      { id: 1, title: "Meals for a busy evening", searchText: "Meals for a busy evening I need a quick dinner with beans", updatedAt: new Date() },
      { id: 2, title: "A much older cycle reflection", updatedAt: new Date(Date.now() - 14 * 86400000) },
    ];
    render(<ConversationLibrary conversations={conversations} hasError={false} onReview={onReview} onContinue={onContinue} onDelete={onDelete} onRename={onRename} onRetry={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Search saved conversations" }), { target: { value: "beans" } });
    expect(screen.getByText("Meals for a busy evening")).toBeTruthy();
    expect(screen.queryByText("A much older cycle reflection")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Edit title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Custom conversation title" }), { target: { value: "Weeknight meal ideas" } });
    fireEvent.click(screen.getByRole("button", { name: "Save custom conversation title" }));
    expect(onRename).toHaveBeenCalledWith(1, "Weeknight meal ideas");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledWith(1);

    fireEvent.change(screen.getByRole("textbox", { name: "Search saved conversations" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "7 days" }));
    expect(screen.queryByText("A much older cycle reflection")).toBeNull();
  });
});
