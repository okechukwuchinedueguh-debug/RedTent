import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = mysqlTable(
  "user_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    preferredCycleLength: int("preferredCycleLength").default(28).notNull(),
    preferredPeriodLength: int("preferredPeriodLength").default(5).notNull(),
    foodCulture: varchar("foodCulture", { length: 120 }).default("Nigerian and global foods").notNull(),
    dietaryPreferences: text("dietaryPreferences"),
    dietaryRestrictions: text("dietaryRestrictions"),
    wellnessGoals: text("wellnessGoals"),
    username: varchar("username", { length: 32 }),
    profilePhotoKey: varchar("profilePhotoKey", { length: 500 }),
    profilePhotoUrl: varchar("profilePhotoUrl", { length: 700 }),
    onboardingCompletedAt: timestamp("onboardingCompletedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ userUnique: uniqueIndex("profile_user_unique").on(table.userId), usernameUnique: uniqueIndex("profile_username_unique").on(table.username) })
);

export const cycleLogs = mysqlTable(
  "cycle_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    startAt: timestamp("startAt").notNull(),
    endAt: timestamp("endAt"),
    flow: mysqlEnum("flow", ["spotting", "light", "medium", "heavy"]),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ userStartIndex: index("cycle_user_start_idx").on(table.userId, table.startAt) })
);

export const wellnessEntries = mysqlTable(
  "wellness_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    entryAt: timestamp("entryAt").notNull(),
    mood: mysqlEnum("mood", ["great", "good", "okay", "low", "difficult"]),
    energy: mysqlEnum("energy", ["low", "medium", "high"]),
    symptoms: text("symptoms").notNull(),
    sleepQuality: mysqlEnum("sleepQuality", ["poor", "fair", "good", "restful"]),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userDayUnique: uniqueIndex("wellness_user_day_unique").on(table.userId, table.entryAt),
    userDateIndex: index("wellness_user_date_idx").on(table.userId, table.entryAt),
  })
);

export const journalEntries = mysqlTable(
  "journal_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    body: text("body").notNull(),
    phase: mysqlEnum("phase", ["menstrual", "follicular", "ovulation", "luteal"]).notNull(),
    entryAt: timestamp("entryAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ userDateIndex: index("journal_user_date_idx").on(table.userId, table.entryAt) })
);

export const foodEntries = mysqlTable(
  "food_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    imageKey: varchar("imageKey", { length: 500 }).notNull(),
    imageUrl: varchar("imageUrl", { length: 700 }).notNull(),
    phase: mysqlEnum("phase", ["menstrual", "follicular", "ovulation", "luteal"]).notNull(),
    lensMode: mysqlEnum("lensMode", ["before", "after"]).default("after").notNull(),
    scanContext: mysqlEnum("scanContext", ["meal", "grocery", "menu", "label", "recipe", "shelf"]).default("meal").notNull(),
    userNotes: text("userNotes"),
    analysisJson: text("analysisJson").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ userCreatedIndex: index("food_user_created_idx").on(table.userId, table.createdAt) })
);

export const askConversations = mysqlTable(
  "ask_conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    includeWellness: int("includeWellness").default(1).notNull(),
    includeFood: int("includeFood").default(1).notNull(),
    includeJournal: int("includeJournal").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ userUpdatedIndex: index("ask_conversation_user_updated_idx").on(table.userId, table.updatedAt) })
);

export const askConversationMessages = mysqlTable(
  "ask_conversation_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userConversationIndex: index("ask_message_user_conversation_idx").on(table.userId, table.conversationId),
    conversationCreatedIndex: index("ask_message_conversation_created_idx").on(table.conversationId, table.createdAt),
  })
);

export const preparationChecklistItems = mysqlTable(
  "preparation_checklist_items",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    isActive: int("isActive").default(1).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ userOrderIndex: index("prep_item_user_order_idx").on(table.userId, table.isActive, table.sortOrder) })
);

export const preparationChecklistCompletions = mysqlTable(
  "preparation_checklist_completions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    itemId: int("itemId").notNull(),
    cycleStartAt: timestamp("cycleStartAt").notNull(),
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  table => ({ userItemCycleUnique: uniqueIndex("prep_completion_user_item_cycle_unique").on(table.userId, table.itemId, table.cycleStartAt), userCycleIndex: index("prep_completion_user_cycle_idx").on(table.userId, table.cycleStartAt) })
);

export const cycleMomentReflections = mysqlTable(
  "cycle_moment_reflections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    moment: mysqlEnum("moment", ["menstrual", "post-menstrual", "follicular", "ovulation", "premenstrual", "luteal"]).notNull(),
    cycleStartAt: timestamp("cycleStartAt").notNull(),
    whatHelped: text("whatHelped").notNull(),
    entryAt: timestamp("entryAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ userMomentCycleUnique: uniqueIndex("reflection_user_moment_cycle_unique").on(table.userId, table.moment, table.cycleStartAt), userCreatedIndex: index("reflection_user_created_idx").on(table.userId, table.entryAt) })
);

export const partnerConnections = mysqlTable(
  "partner_connections",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull(),
    partnerEmail: varchar("partnerEmail", { length: 320 }).notNull(),
    partnerName: varchar("partnerName", { length: 80 }),
    tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
    consentedAt: timestamp("consentedAt").notNull(),
    acceptedAt: timestamp("acceptedAt"),
    revokedAt: timestamp("revokedAt"),
    emailAlertsEnabled: int("emailAlertsEnabled").default(0).notNull(),
    browserAlertsEnabled: int("browserAlertsEnabled").default(0).notNull(),
    lastPartnerReminderAt: timestamp("lastPartnerReminderAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ tokenUnique: uniqueIndex("partner_connection_token_unique").on(table.tokenHash), ownerActiveIndex: index("partner_connection_owner_active_idx").on(table.ownerUserId, table.revokedAt) })
);

export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    ownerBrowserAlertsEnabled: int("ownerBrowserAlertsEnabled").default(0).notNull(),
    reminderTime: varchar("reminderTime", { length: 5 }).default("09:00").notNull(),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
    consentedAt: timestamp("consentedAt"),
    lastOwnerReminderAt: timestamp("lastOwnerReminderAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ userUnique: uniqueIndex("notification_preference_user_unique").on(table.userId), scheduleIndex: index("notification_preference_schedule_idx").on(table.scheduleCronTaskUid) })
);

export const browserPushSubscriptions = mysqlTable(
  "browser_push_subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    partnerConnectionId: int("partnerConnectionId"),
    endpoint: varchar("endpoint", { length: 1200 }).notNull(),
    p256dh: varchar("p256dh", { length: 300 }).notNull(),
    authSecret: varchar("authSecret", { length: 300 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ endpointUnique: uniqueIndex("push_subscription_endpoint_unique").on(table.endpoint), userPartnerIndex: index("push_subscription_user_partner_idx").on(table.userId, table.partnerConnectionId) })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CycleLog = typeof cycleLogs.$inferSelect;
export type WellnessEntry = typeof wellnessEntries.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type AskConversation = typeof askConversations.$inferSelect;
export type AskConversationMessage = typeof askConversationMessages.$inferSelect;
export type PreparationChecklistItem = typeof preparationChecklistItems.$inferSelect;
export type PreparationChecklistCompletion = typeof preparationChecklistCompletions.$inferSelect;
export type CycleMomentReflection = typeof cycleMomentReflections.$inferSelect;
export type PartnerConnection = typeof partnerConnections.$inferSelect;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type BrowserPushSubscription = typeof browserPushSubscriptions.$inferSelect;
