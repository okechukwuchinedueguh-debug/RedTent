import { readRedtentDeviceMode, saveRedtentDeviceMode } from "./deviceMode";
import { beforeEach, describe, expect, it } from "vitest";

describe("Redtent shared-device mode", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } } });
  });

  it("starts unset and keeps the partner-phone choice scoped to the signed-in account", () => {
    expect(readRedtentDeviceMode(7)).toBe("unset");
    saveRedtentDeviceMode(7, "partner");
    expect(readRedtentDeviceMode(7)).toBe("partner");
    expect(readRedtentDeviceMode(8)).toBe("unset");
  });
});
