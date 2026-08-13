import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getOrCreateProfile: vi.fn(),
  listCycleLogs: vi.fn(),
  listWellnessEntries: vi.fn(),
  deleteCycleLog: vi.fn(),
  deleteJournalEntry: vi.fn(),
  deleteFoodEntry: vi.fn(),
}));

vi.mock("./db", () => ({
  ...dbMocks,
  createCycleLog: vi.fn(), updateCycleLog: vi.fn(), getWellnessEntry: vi.fn(), upsertWellnessEntry: vi.fn(),
  listJournalEntries: vi.fn(), createJournalEntry: vi.fn(), updateJournalEntry: vi.fn(),
  listFoodEntries: vi.fn(), createFoodEntry: vi.fn(),
  upsertUser: vi.fn(), getUserByOpenId: vi.fn(), getDb: vi.fn(),
}));

import { appRouter } from "./routers";

function contextFor(userId: number): TrpcContext {
  return {
    user: { id: userId, openId: `user-${userId}`, name: "Test User", email: "test@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("user-scoped Redtent procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getOrCreateProfile.mockResolvedValue({ userId: 42, preferredCycleLength: 28, preferredPeriodLength: 5 });
    dbMocks.listCycleLogs.mockResolvedValue([]);
  });

  it("normalizes wellness list dates and attaches the current user id", async () => {
    dbMocks.listWellnessEntries.mockResolvedValue([]);
    const caller = appRouter.createCaller(contextFor(42));
    await caller.wellness.list({ from: new Date("2026-08-13T12:00:00.000Z"), to: new Date("2026-08-13T12:00:00.000Z") });
    expect(dbMocks.listWellnessEntries).toHaveBeenCalledWith(42, new Date("2026-08-13T00:00:00.000Z"), new Date("2026-08-13T00:00:00.000Z"));
  });

  it("passes the authenticated user id to destructive personal-data procedures", async () => {
    dbMocks.deleteCycleLog.mockResolvedValue(true);
    dbMocks.deleteJournalEntry.mockResolvedValue(true);
    dbMocks.deleteFoodEntry.mockResolvedValue(true);
    const caller = appRouter.createCaller(contextFor(42));
    await caller.cycles.delete({ id: 11 });
    await caller.journal.delete({ id: 12 });
    await caller.food.delete({ id: 13 });
    expect(dbMocks.deleteCycleLog).toHaveBeenCalledWith(42, 11);
    expect(dbMocks.deleteJournalEntry).toHaveBeenCalledWith(42, 12);
    expect(dbMocks.deleteFoodEntry).toHaveBeenCalledWith(42, 13);
  });
});
