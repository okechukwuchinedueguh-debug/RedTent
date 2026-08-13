import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./JournalPage.tsx", import.meta.url), "utf8");

describe("Your Space saved conversation library contract", () => {
  it("lists private Ask Redtent conversations with open and removal controls", () => {
    expect(source).toContain("ask.conversations.list");
    expect(source).toContain("Saved Ask Redtent conversations");
    expect(source).toContain("Open conversation");
    expect(source).toContain("ask.conversations.delete");
    expect(source).toContain("conversations.error");
    expect(source).toContain("Your saved conversations are not loading right now.");
  });
});
