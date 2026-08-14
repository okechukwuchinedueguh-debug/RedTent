import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..", "..", "..");
const readSource = (relativePath: string) => readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("retired companion experience", () => {
  it("does not expose a public companion route or shared-device selection in the active app shell", () => {
    const routes = readSource("client/src/App.tsx");
    const layout = readSource("client/src/components/DashboardLayout.tsx");

    expect(routes).not.toContain("PartnerCompanionPage");
    expect(routes).not.toContain('path="/companion"');
    expect(layout).not.toContain("DeviceModeChoice");
    expect(layout).not.toContain("SharedDeviceCompanion");
  });
});
