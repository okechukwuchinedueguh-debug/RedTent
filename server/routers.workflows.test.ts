import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getOrCreateProfile: vi.fn(),
  listCycleLogs: vi.fn(),
  createCycleLog: vi.fn(),
  listWellnessEntries: vi.fn(),
  upsertWellnessEntry: vi.fn(),
  createJournalEntry: vi.fn(),
  updateJournalEntry: vi.fn(),
  deleteJournalEntry: vi.fn(),
  createFoodEntry: vi.fn(),
  getProfileByUsername: vi.fn(),
  updateProfileIdentity: vi.fn(),
  storagePut: vi.fn(),
  storageGetSignedUrl: vi.fn(),
  listLLMModels: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => ({
  ...mocks,
  updateCycleLog: vi.fn(), deleteCycleLog: vi.fn(), getWellnessEntry: vi.fn(),
  listJournalEntries: vi.fn(), listFoodEntries: vi.fn(), deleteFoodEntry: vi.fn(),
  upsertUser: vi.fn(), getUserByOpenId: vi.fn(), getDb: vi.fn(),
}));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut, storageGetSignedUrl: mocks.storageGetSignedUrl }));
vi.mock("./_core/llm", () => ({ listLLMModels: mocks.listLLMModels, invokeLLM: mocks.invokeLLM }));

import { appRouter } from "./routers";

function contextFor(userId: number): TrpcContext {
  return {
    user: { id: userId, openId: `user-${userId}`, name: "Test User", email: "test@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const validFoodAnalysis = {
  detectedFoods: ["rice bowl", "vegetables"],
  macroEstimates: { protein: "~20–30 g", carbohydrates: "~45–55 g", fats: "~12–18 g", fibre: "~6–9 g" },
  micronutrientHighlights: [{ nutrient: "Iron", observation: "Visible greens may contribute some iron." }],
  phaseSpecificSuggestions: ["If it fits your preferences, consider a vitamin C source alongside this meal."],
  confidence: "medium",
  limitations: "Portion size and preparation are estimated from a single photo.",
  safetyNote: "This is general wellness information, not medical advice.",
};

describe("core Redtent workflows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOrCreateProfile.mockResolvedValue({ userId: 77, preferredCycleLength: 28, preferredPeriodLength: 5 });
    mocks.listCycleLogs.mockResolvedValue([]);
  });

  it("saves a period log with the authenticated user and normalized dates", async () => {
    mocks.createCycleLog.mockResolvedValue(301);
    const caller = appRouter.createCaller(contextFor(77));
    const result = await caller.cycles.create({ startAt: new Date("2026-08-03T12:00:00.000Z"), endAt: new Date("2026-08-07T12:00:00.000Z"), flow: "medium", notes: "A private note" });
    expect(result).toEqual({ id: 301 });
    expect(mocks.createCycleLog).toHaveBeenCalledWith(77, expect.objectContaining({ startAt: new Date("2026-08-03T00:00:00.000Z"), endAt: new Date("2026-08-07T00:00:00.000Z") }));
  });

  it("saves a wellness check-in in the selected day’s normalized record", async () => {
    mocks.upsertWellnessEntry.mockResolvedValue({ id: 21 });
    const caller = appRouter.createCaller(contextFor(77));
    await caller.wellness.save({ entryAt: new Date("2026-08-13T12:00:00.000Z"), mood: "good", energy: "medium", symptoms: ["Cramps", "Fatigue"], sleepQuality: "fair", notes: "A private note" });
    expect(mocks.upsertWellnessEntry).toHaveBeenCalledWith(77, expect.objectContaining({ entryAt: new Date("2026-08-13T00:00:00.000Z"), symptoms: JSON.stringify(["Cramps", "Fatigue"]) }));
  });

  it("creates, updates, and deletes a user-scoped journal reflection", async () => {
    mocks.createJournalEntry.mockResolvedValue(401);
    mocks.updateJournalEntry.mockResolvedValue(true);
    mocks.deleteJournalEntry.mockResolvedValue(true);
    const caller = appRouter.createCaller(contextFor(77));
    const input = { title: "A note", body: "My private reflection", phase: "luteal" as const, entryAt: new Date("2026-08-13T12:00:00.000Z") };
    await expect(caller.journal.create(input)).resolves.toEqual({ id: 401 });
    await expect(caller.journal.update({ id: 401, ...input })).resolves.toEqual({ success: true });
    await expect(caller.journal.delete({ id: 401 })).resolves.toEqual({ success: true });
    expect(mocks.createJournalEntry).toHaveBeenCalledWith(77, expect.objectContaining({ phase: "luteal" }));
    expect(mocks.updateJournalEntry).toHaveBeenCalledWith(77, 401, expect.any(Object));
    expect(mocks.deleteJournalEntry).toHaveBeenCalledWith(77, 401);
  });

  it("uploads and records a structured LLM food observation for the authenticated user", async () => {
    mocks.storagePut.mockResolvedValue({ key: "redtent/77/food/meal.jpg", url: "/manus-storage/redtent/77/food/meal.jpg" });
    mocks.storageGetSignedUrl.mockResolvedValue("https://signed.example/meal.jpg");
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-vision" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify(validFoodAnalysis) } }] });
    mocks.createFoodEntry.mockResolvedValue(501);
    const caller = appRouter.createCaller(contextFor(77));
    const result = await caller.food.analyse({ dataUrl: "data:image/jpeg;base64,aGVsbG8=", filename: "lunch.jpg" });
    expect(result).toMatchObject({ id: 501, phase: "menstrual", analysis: validFoodAnalysis });
    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("redtent/77/food/"), expect.any(Buffer), "image/jpeg");
    expect(mocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({ model: "gpt-5-vision" }));
    expect(mocks.createFoodEntry).toHaveBeenCalledWith(77, expect.objectContaining({ phase: "menstrual", imageKey: "redtent/77/food/meal.jpg" }));
  });

  it("saves a unique username and profile photo only in the authenticated user profile", async () => {
    mocks.getProfileByUsername.mockResolvedValue(undefined);
    mocks.storagePut.mockResolvedValue({ key: "redtent/77/profile/profile-photo_a1b2c3d4.png", url: "/manus-storage/redtent/77/profile/profile-photo_a1b2c3d4.png" });
    mocks.updateProfileIdentity.mockResolvedValue({ userId: 77, username: "redtent_user" });
    const caller = appRouter.createCaller(contextFor(77));
    await caller.profile.updateIdentity({ username: "redtent_user", photoDataUrl: "data:image/png;base64,aGVsbG8=" });
    expect(mocks.getProfileByUsername).toHaveBeenCalledWith("redtent_user");
    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("redtent/77/profile/profile-photo.png"), expect.any(Buffer), "image/png");
    expect(mocks.updateProfileIdentity).toHaveBeenCalledWith(77, expect.objectContaining({ username: "redtent_user", profilePhotoUrl: expect.stringContaining("redtent/77/profile/") }));
  });

  it("rejects a username held by another Redtent account", async () => {
    mocks.getProfileByUsername.mockResolvedValue({ userId: 88, username: "taken_name" });
    const caller = appRouter.createCaller(contextFor(77));
    await expect(caller.profile.updateIdentity({ username: "taken_name" })).rejects.toMatchObject({ code: "CONFLICT" });
    expect(mocks.updateProfileIdentity).not.toHaveBeenCalled();
  });
});
