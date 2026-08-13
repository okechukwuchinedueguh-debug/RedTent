import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("CycleMomentCard", () => {
  it("presents a gentle check-in and reusable signal chips without diagnostic copy", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/CycleMomentCard.tsx"), "utf8");

    expect(source).toContain("A gentle check-in");
    expect(source).toContain("experience.signals.map");
    expect(source).not.toContain("diagnosis");
  });
});
