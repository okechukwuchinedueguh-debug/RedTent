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
  updateProfile: vi.fn(),
  clearProfilePhoto: vi.fn(),
  completeProfileOnboarding: vi.fn(),
  createAskConversation: vi.fn(),
  listAskConversations: vi.fn(),
  getAskConversation: vi.fn(),
  deleteAskConversation: vi.fn(),
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

  it("clears only the authenticated user’s profile-photo reference", async () => {
    mocks.clearProfilePhoto.mockResolvedValue({ userId: 77, profilePhotoUrl: null });
    const caller = appRouter.createCaller(contextFor(77));
    await expect(caller.profile.removePhoto()).resolves.toMatchObject({ userId: 77, profilePhotoUrl: null });
    expect(mocks.clearProfilePhoto).toHaveBeenCalledWith(77);
  });

  it("records onboarding completion only for the authenticated user", async () => {
    mocks.completeProfileOnboarding.mockResolvedValue({ userId: 77, onboardingCompletedAt: new Date() });
    const caller = appRouter.createCaller(contextFor(77));
    await expect(caller.profile.completeOnboarding()).resolves.toMatchObject({ userId: 77 });
    expect(mocks.completeProfileOnboarding).toHaveBeenCalledWith(77);
  });

  it("saves the complete onboarding path in the authenticated user’s private profile", async () => {
    mocks.getProfileByUsername.mockResolvedValue(undefined);
    mocks.storagePut.mockResolvedValue({ key: "redtent/77/profile/profile-photo.webp", url: "/manus-storage/redtent/77/profile/profile-photo.webp" });
    mocks.updateProfileIdentity.mockResolvedValue({ userId: 77, username: "calm_cycle" });
    mocks.updateProfile.mockResolvedValue({ userId: 77, preferredCycleLength: 30, preferredPeriodLength: 6 });
    mocks.createCycleLog.mockResolvedValue(601);
    mocks.completeProfileOnboarding.mockResolvedValue({ userId: 77, onboardingCompletedAt: new Date() });
    const caller = appRouter.createCaller(contextFor(77));

    await caller.profile.updateIdentity({ username: "calm_cycle", photoDataUrl: "data:image/webp;base64,aGVsbG8=" });
    await caller.profile.save({ preferredCycleLength: 30, preferredPeriodLength: 6 });
    await caller.cycles.create({ startAt: new Date("2026-08-04T12:00:00.000Z") });
    await caller.profile.completeOnboarding();

    expect(mocks.updateProfileIdentity).toHaveBeenCalledWith(77, expect.objectContaining({ username: "calm_cycle", profilePhotoUrl: expect.stringContaining("redtent/77/profile/") }));
    expect(mocks.updateProfile).toHaveBeenCalledWith(77, { preferredCycleLength: 30, preferredPeriodLength: 6 });
    expect(mocks.createCycleLog).toHaveBeenCalledWith(77, expect.objectContaining({ startAt: new Date("2026-08-04T00:00:00.000Z") }));
    expect(mocks.completeProfileOnboarding).toHaveBeenCalledWith(77);
  });

  it("stores and retrieves a saved Ask Redtent conversation only through the authenticated user scope", async () => {
    const messages = [
      { role: "user" as const, content: "What could I eat tonight?" },
      { role: "assistant" as const, content: "Here are a few gentle options to consider." },
    ];
    const savedConversation = { id: 701, userId: 77, title: "What could I eat tonight?", includeWellness: 1, includeFood: 1, includeJournal: 0, createdAt: new Date(), updatedAt: new Date(), messages };
    mocks.createAskConversation.mockResolvedValue(701);
    mocks.listAskConversations.mockResolvedValue([savedConversation]);
    mocks.getAskConversation.mockResolvedValue(savedConversation);
    mocks.deleteAskConversation.mockResolvedValue(true);
    const caller = appRouter.createCaller(contextFor(77));

    await expect(caller.ask.conversations.create({ title: savedConversation.title, includeWellness: true, includeFood: true, includeJournal: false, messages })).resolves.toEqual({ id: 701 });
    await expect(caller.ask.conversations.list()).resolves.toEqual([savedConversation]);
    await expect(caller.ask.conversations.get({ id: 701 })).resolves.toEqual(savedConversation);
    await expect(caller.ask.conversations.delete({ id: 701 })).resolves.toEqual({ success: true });

    expect(mocks.createAskConversation).toHaveBeenCalledWith(77, expect.objectContaining({ title: savedConversation.title, messages }));
    expect(mocks.listAskConversations).toHaveBeenCalledWith(77);
    expect(mocks.getAskConversation).toHaveBeenCalledWith(77, 701);
    expect(mocks.deleteAskConversation).toHaveBeenCalledWith(77, 701);
  });
});
