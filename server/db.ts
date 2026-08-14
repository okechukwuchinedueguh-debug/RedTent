import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  askConversationMessages,
  askConversations,
  cycleLogs,
  cycleMomentReflections,
  foodEntries,
  type InsertUser,
  journalEntries,
  notificationPreferences,
  partnerConnections,
  preparationChecklistCompletions,
  preparationChecklistItems,
  userProfiles,
  users,
  wellnessEntries,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requiredDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requiredDb();
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  (["name", "email", "loginMethod"] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getOrCreateProfile(userId: number) {
  const db = await requiredDb();
  await db.insert(userProfiles).values({ userId }).onDuplicateKeyUpdate({ set: { userId } });
  const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return profile[0]!;
}

export async function updateProfile(userId: number, values: { preferredCycleLength?: number; preferredPeriodLength?: number; foodCulture?: string; dietaryPreferences?: string | null; dietaryRestrictions?: string | null; wellnessGoals?: string | null }) {
  const db = await requiredDb();
  await db.insert(userProfiles).values({ userId, ...values }).onDuplicateKeyUpdate({ set: values });
  return getOrCreateProfile(userId);
}

export async function getProfileByUsername(username: string) {
  const db = await requiredDb();
  const result = await db.select().from(userProfiles).where(eq(userProfiles.username, username)).limit(1);
  return result[0];
}

export async function updateProfileIdentity(userId: number, values: { username?: string; profilePhotoKey?: string | null; profilePhotoUrl?: string | null }) {
  const db = await requiredDb();
  await db.insert(userProfiles).values({ userId, ...values }).onDuplicateKeyUpdate({ set: values });
  return getOrCreateProfile(userId);
}

export async function clearProfilePhoto(userId: number) {
  return updateProfileIdentity(userId, { profilePhotoKey: null, profilePhotoUrl: null });
}

export async function completeProfileOnboarding(userId: number) {
  const db = await requiredDb();
  await db.insert(userProfiles).values({ userId, onboardingCompletedAt: new Date() }).onDuplicateKeyUpdate({ set: { onboardingCompletedAt: new Date() } });
  return getOrCreateProfile(userId);
}

export async function listPreparationChecklist(userId: number, cycleStartAt: Date | null) {
  const db = await requiredDb();
  const items = await db.select().from(preparationChecklistItems).where(and(eq(preparationChecklistItems.userId, userId), eq(preparationChecklistItems.isActive, 1))).orderBy(asc(preparationChecklistItems.sortOrder), asc(preparationChecklistItems.id));
  if (!cycleStartAt || !items.length) return items.map(item => ({ ...item, completed: false }));
  const completions = await db.select().from(preparationChecklistCompletions).where(and(eq(preparationChecklistCompletions.userId, userId), eq(preparationChecklistCompletions.cycleStartAt, cycleStartAt)));
  const completedIds = new Set(completions.map(completion => completion.itemId));
  return items.map(item => ({ ...item, completed: completedIds.has(item.id) }));
}

export async function createPreparationChecklistItem(userId: number, title: string) {
  const db = await requiredDb();
  const existing = await db.select().from(preparationChecklistItems).where(eq(preparationChecklistItems.userId, userId));
  const sortOrder = existing.reduce((current, item) => Math.max(current, item.sortOrder), -1) + 1;
  const result = await db.insert(preparationChecklistItems).values({ userId, title, sortOrder });
  return Number(result[0].insertId);
}

export async function updatePreparationChecklistItem(userId: number, id: number, title: string) {
  const db = await requiredDb();
  const result = await db.update(preparationChecklistItems).set({ title }).where(and(eq(preparationChecklistItems.id, id), eq(preparationChecklistItems.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function archivePreparationChecklistItem(userId: number, id: number) {
  const db = await requiredDb();
  const result = await db.update(preparationChecklistItems).set({ isActive: 0 }).where(and(eq(preparationChecklistItems.id, id), eq(preparationChecklistItems.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function togglePreparationChecklistCompletion(userId: number, itemId: number, cycleStartAt: Date, completed: boolean) {
  const db = await requiredDb();
  const item = await db.select({ id: preparationChecklistItems.id }).from(preparationChecklistItems).where(and(eq(preparationChecklistItems.id, itemId), eq(preparationChecklistItems.userId, userId), eq(preparationChecklistItems.isActive, 1))).limit(1);
  if (!item[0]) return false;
  if (completed) await db.insert(preparationChecklistCompletions).values({ userId, itemId, cycleStartAt }).onDuplicateKeyUpdate({ set: { completedAt: new Date() } });
  else await db.delete(preparationChecklistCompletions).where(and(eq(preparationChecklistCompletions.userId, userId), eq(preparationChecklistCompletions.itemId, itemId), eq(preparationChecklistCompletions.cycleStartAt, cycleStartAt)));
  return true;
}

export async function listCycleMomentReflections(userId: number) {
  const db = await requiredDb();
  return db.select().from(cycleMomentReflections).where(eq(cycleMomentReflections.userId, userId)).orderBy(desc(cycleMomentReflections.entryAt));
}

export async function upsertCycleMomentReflection(userId: number, values: { moment: "menstrual" | "post-menstrual" | "follicular" | "ovulation" | "premenstrual" | "luteal"; cycleStartAt: Date; whatHelped: string; entryAt: Date }) {
  const db = await requiredDb();
  await db.insert(cycleMomentReflections).values({ userId, ...values }).onDuplicateKeyUpdate({ set: { whatHelped: values.whatHelped, entryAt: values.entryAt } });
  const reflection = await db.select().from(cycleMomentReflections).where(and(eq(cycleMomentReflections.userId, userId), eq(cycleMomentReflections.moment, values.moment), eq(cycleMomentReflections.cycleStartAt, values.cycleStartAt))).limit(1);
  return reflection[0];
}

export async function getNotificationPreferences(userId: number) {
  const db = await requiredDb();
  await db.insert(notificationPreferences).values({ userId }).onDuplicateKeyUpdate({ set: { userId } });
  const preferences = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  return preferences[0]!;
}

export async function updateNotificationPreferences(userId: number, values: { ownerBrowserAlertsEnabled?: boolean; reminderTime?: string; consentedAt?: Date | null; scheduleCronTaskUid?: string | null }) {
  const db = await requiredDb();
  const set = {
    ...(values.ownerBrowserAlertsEnabled === undefined ? {} : { ownerBrowserAlertsEnabled: values.ownerBrowserAlertsEnabled ? 1 : 0 }),
    ...(values.reminderTime === undefined ? {} : { reminderTime: values.reminderTime }),
    ...(values.consentedAt === undefined ? {} : { consentedAt: values.consentedAt }),
    ...(values.scheduleCronTaskUid === undefined ? {} : { scheduleCronTaskUid: values.scheduleCronTaskUid }),
  };
  await db.insert(notificationPreferences).values({ userId, ...set }).onDuplicateKeyUpdate({ set });
  return getNotificationPreferences(userId);
}

export async function listPartnerConnections(ownerUserId: number) {
  const db = await requiredDb();
  return db.select().from(partnerConnections).where(eq(partnerConnections.ownerUserId, ownerUserId)).orderBy(desc(partnerConnections.createdAt));
}

export async function createPartnerConnection(ownerUserId: number, values: { partnerEmail: string; partnerName?: string | null; tokenHash: string; emailAlertsEnabled: boolean; browserAlertsEnabled: boolean }) {
  const db = await requiredDb();
  const result = await db.insert(partnerConnections).values({ ownerUserId, partnerEmail: values.partnerEmail, partnerName: values.partnerName ?? null, tokenHash: values.tokenHash, consentedAt: new Date(), emailAlertsEnabled: values.emailAlertsEnabled ? 1 : 0, browserAlertsEnabled: values.browserAlertsEnabled ? 1 : 0 });
  return Number(result[0].insertId);
}

export async function updatePartnerConnection(ownerUserId: number, id: number, values: { partnerName?: string | null; emailAlertsEnabled?: boolean; browserAlertsEnabled?: boolean }) {
  const db = await requiredDb();
  const set = {
    ...(values.partnerName === undefined ? {} : { partnerName: values.partnerName }),
    ...(values.emailAlertsEnabled === undefined ? {} : { emailAlertsEnabled: values.emailAlertsEnabled ? 1 : 0 }),
    ...(values.browserAlertsEnabled === undefined ? {} : { browserAlertsEnabled: values.browserAlertsEnabled ? 1 : 0 }),
  };
  const result = await db.update(partnerConnections).set(set).where(and(eq(partnerConnections.id, id), eq(partnerConnections.ownerUserId, ownerUserId), isNull(partnerConnections.revokedAt)));
  return result[0].affectedRows > 0;
}

export async function revokePartnerConnection(ownerUserId: number, id: number) {
  const db = await requiredDb();
  const result = await db.update(partnerConnections).set({ revokedAt: new Date(), emailAlertsEnabled: 0, browserAlertsEnabled: 0 }).where(and(eq(partnerConnections.id, id), eq(partnerConnections.ownerUserId, ownerUserId), isNull(partnerConnections.revokedAt)));
  return result[0].affectedRows > 0;
}

export async function getPartnerConnectionByToken(tokenHash: string) {
  const db = await requiredDb();
  const connection = await db.select().from(partnerConnections).where(eq(partnerConnections.tokenHash, tokenHash)).limit(1);
  return connection[0] && !connection[0].revokedAt ? connection[0] : undefined;
}

export async function listCycleLogs(userId: number) {
  const db = await requiredDb();
  return db.select().from(cycleLogs).where(eq(cycleLogs.userId, userId)).orderBy(desc(cycleLogs.startAt));
}

export async function createCycleLog(userId: number, values: { startAt: Date; endAt?: Date | null; flow?: "spotting" | "light" | "medium" | "heavy" | null; notes?: string | null }) {
  const db = await requiredDb();
  const result = await db.insert(cycleLogs).values({ userId, ...values });
  return Number(result[0].insertId);
}

export async function updateCycleLog(userId: number, id: number, values: { startAt?: Date; endAt?: Date | null; flow?: "spotting" | "light" | "medium" | "heavy" | null; notes?: string | null }) {
  const db = await requiredDb();
  const result = await db.update(cycleLogs).set(values).where(and(eq(cycleLogs.id, id), eq(cycleLogs.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function deleteCycleLog(userId: number, id: number) {
  const db = await requiredDb();
  const result = await db.delete(cycleLogs).where(and(eq(cycleLogs.id, id), eq(cycleLogs.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function getWellnessEntry(userId: number, entryAt: Date) {
  const db = await requiredDb();
  const result = await db.select().from(wellnessEntries).where(and(eq(wellnessEntries.userId, userId), eq(wellnessEntries.entryAt, entryAt))).limit(1);
  return result[0];
}

export async function upsertWellnessEntry(userId: number, values: { entryAt: Date; mood?: "great" | "good" | "okay" | "low" | "difficult" | null; energy?: "low" | "medium" | "high" | null; symptoms: string; sleepQuality?: "poor" | "fair" | "good" | "restful" | null; notes?: string | null }) {
  const db = await requiredDb();
  await db.insert(wellnessEntries).values({ userId, ...values }).onDuplicateKeyUpdate({
    set: {
      mood: values.mood,
      energy: values.energy,
      symptoms: values.symptoms,
      sleepQuality: values.sleepQuality,
      notes: values.notes,
    },
  });
  return getWellnessEntry(userId, values.entryAt);
}

export async function listWellnessEntries(userId: number, from?: Date, to?: Date) {
  const db = await requiredDb();
  const conditions = [eq(wellnessEntries.userId, userId)];
  if (from) conditions.push(gte(wellnessEntries.entryAt, from));
  if (to) conditions.push(lte(wellnessEntries.entryAt, to));
  return db.select().from(wellnessEntries).where(and(...conditions)).orderBy(desc(wellnessEntries.entryAt));
}

export async function listJournalEntries(userId: number) {
  const db = await requiredDb();
  return db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.entryAt));
}

export async function createJournalEntry(userId: number, values: { title: string; body: string; phase: "menstrual" | "follicular" | "ovulation" | "luteal"; entryAt: Date }) {
  const db = await requiredDb();
  const result = await db.insert(journalEntries).values({ userId, ...values });
  return Number(result[0].insertId);
}

export async function updateJournalEntry(userId: number, id: number, values: { title: string; body: string; phase: "menstrual" | "follicular" | "ovulation" | "luteal"; entryAt: Date }) {
  const db = await requiredDb();
  const result = await db.update(journalEntries).set(values).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function deleteJournalEntry(userId: number, id: number) {
  const db = await requiredDb();
  const result = await db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function listFoodEntries(userId: number) {
  const db = await requiredDb();
  return db.select().from(foodEntries).where(eq(foodEntries.userId, userId)).orderBy(desc(foodEntries.createdAt));
}

export async function createFoodEntry(userId: number, values: { imageKey: string; imageUrl: string; phase: "menstrual" | "follicular" | "ovulation" | "luteal"; lensMode?: "before" | "after"; scanContext?: "meal" | "grocery" | "menu" | "label" | "recipe" | "shelf"; userNotes?: string | null; analysisJson: string }) {
  const db = await requiredDb();
  const result = await db.insert(foodEntries).values({ userId, ...values });
  return Number(result[0].insertId);
}

export async function updateFoodEntry(userId: number, id: number, values: { analysisJson?: string; userNotes?: string | null; lensMode?: "before" | "after"; scanContext?: "meal" | "grocery" | "menu" | "label" | "recipe" | "shelf" }) {
  const db = await requiredDb();
  const result = await db.update(foodEntries).set(values).where(and(eq(foodEntries.id, id), eq(foodEntries.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function deleteFoodEntry(userId: number, id: number) {
  const db = await requiredDb();
  const result = await db.delete(foodEntries).where(and(eq(foodEntries.id, id), eq(foodEntries.userId, userId)));
  return result[0].affectedRows > 0;
}

type SavedAskMessage = { role: "user" | "assistant"; content: string };

export async function createAskConversation(userId: number, values: { title: string; includeWellness: boolean; includeFood: boolean; includeJournal: boolean; messages: SavedAskMessage[] }) {
  const db = await requiredDb();
  return db.transaction(async tx => {
    const result = await tx.insert(askConversations).values({
      userId,
      title: values.title,
      includeWellness: values.includeWellness ? 1 : 0,
      includeFood: values.includeFood ? 1 : 0,
      includeJournal: values.includeJournal ? 1 : 0,
    });
    const conversationId = Number(result[0].insertId);
    await tx.insert(askConversationMessages).values(values.messages.map(message => ({
      conversationId,
      userId,
      role: message.role,
      content: message.content,
    })));
    return conversationId;
  });
}

export async function listAskConversations(userId: number) {
  const db = await requiredDb();
  const conversations = await db.select().from(askConversations).where(eq(askConversations.userId, userId)).orderBy(desc(askConversations.updatedAt));
  if (!conversations.length) return conversations;
  const messages = await db.select({ conversationId: askConversationMessages.conversationId, content: askConversationMessages.content }).from(askConversationMessages).where(and(eq(askConversationMessages.userId, userId), inArray(askConversationMessages.conversationId, conversations.map(conversation => conversation.id))));
  const searchTextByConversation = new Map<number, string>();
  for (const message of messages) searchTextByConversation.set(message.conversationId, `${searchTextByConversation.get(message.conversationId) || ""} ${message.content}`.trim());
  return conversations.map(conversation => ({ ...conversation, searchText: `${conversation.title} ${searchTextByConversation.get(conversation.id) || ""}`.trim() }));
}

export async function getAskConversation(userId: number, id: number) {
  const db = await requiredDb();
  const conversation = await db.select().from(askConversations).where(and(eq(askConversations.id, id), eq(askConversations.userId, userId))).limit(1);
  if (!conversation[0]) return undefined;
  const messages = await db.select().from(askConversationMessages).where(and(eq(askConversationMessages.conversationId, id), eq(askConversationMessages.userId, userId))).orderBy(asc(askConversationMessages.createdAt), asc(askConversationMessages.id));
  return { ...conversation[0], messages };
}

export async function deleteAskConversation(userId: number, id: number) {
  const db = await requiredDb();
  return db.transaction(async tx => {
    await tx.delete(askConversationMessages).where(and(eq(askConversationMessages.conversationId, id), eq(askConversationMessages.userId, userId)));
    const result = await tx.delete(askConversations).where(and(eq(askConversations.id, id), eq(askConversations.userId, userId)));
    return result[0].affectedRows > 0;
  });
}

export async function updateAskConversationTitle(userId: number, id: number, title: string) {
  const db = await requiredDb();
  const result = await db.update(askConversations).set({ title, updatedAt: new Date() }).where(and(eq(askConversations.id, id), eq(askConversations.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function appendAskConversationMessages(userId: number, id: number, messages: SavedAskMessage[], context: { includeWellness: boolean; includeFood: boolean; includeJournal: boolean }) {
  const db = await requiredDb();
  return db.transaction(async tx => {
    const updated = await tx.update(askConversations).set({ updatedAt: new Date(), includeWellness: context.includeWellness ? 1 : 0, includeFood: context.includeFood ? 1 : 0, includeJournal: context.includeJournal ? 1 : 0 }).where(and(eq(askConversations.id, id), eq(askConversations.userId, userId)));
    if (updated[0].affectedRows === 0) return false;
    await tx.insert(askConversationMessages).values(messages.map(message => ({ conversationId: id, userId, role: message.role, content: message.content })));
    return true;
  });
}
