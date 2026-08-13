import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  askConversationMessages,
  askConversations,
  cycleLogs,
  foodEntries,
  type InsertUser,
  journalEntries,
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
