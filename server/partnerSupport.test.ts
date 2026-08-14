import type { TrpcContext } from "./_core/context";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPartnerConnectionByToken: vi.fn(),
  getOrCreateProfile: vi.fn(),
  listCycleLogs: vi.fn(),
}));

vi.mock("./db", () => ({ ...mocks }));

import { appRouter } from "./routers";

describe("partner companion boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPartnerConnectionByToken.mockResolvedValue({ id: 9, ownerUserId: 7, partnerEmail: "partner@example.com", partnerName: "Sam", revokedAt: null, browserAlertsEnabled: 1, emailAlertsEnabled: 1 });
    mocks.getOrCreateProfile.mockResolvedValue({ userId: 7, preferredCycleLength: 28, preferredPeriodLength: 5, username: "Dera" });
    mocks.listCycleLogs.mockResolvedValue([{ id: 1, userId: 7, startAt: new Date("2026-08-01T00:00:00Z"), endAt: null, flow: null, notes: null, createdAt: new Date(), updatedAt: new Date() }]);
  });

  it("returns only a general support cue and no private logs or recipient email", async () => {
    const caller = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} }, res: {} } as TrpcContext);
    const result = await caller.partner.companion({ token: "a".repeat(32) });

    expect(result.ownerName).toBe("Dera");
    expect(result.support.privacy).toContain("never includes private journals");
    expect(result).not.toHaveProperty("partnerEmail");
    expect(JSON.stringify(result)).not.toContain("partner@example.com");
    expect(JSON.stringify(result)).not.toContain("notes");
  });
});
