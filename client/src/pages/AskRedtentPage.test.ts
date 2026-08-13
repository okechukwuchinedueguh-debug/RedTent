import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./AskRedtentPage.tsx", import.meta.url), "utf8");

describe("AskRedtentPage mobile layout contract", () => {
  it("uses dedicated dark-theme surfaces and reserves space below the fixed mobile navigation", () => {
    expect(source).toContain("ask-redtent-page");
    expect(source).toContain("pb-48");
    expect(source).toContain("ask-redtent-chat-header");
    expect(source).toContain("clamp(17rem, calc(100dvh - 31rem), 31rem)");
    expect(source).toContain("order-2 h-fit p-5 lg:order-1");
    expect(source).toContain("order-1 overflow-hidden");
  });
});
