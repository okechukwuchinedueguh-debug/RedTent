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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CycleLog = typeof cycleLogs.$inferSelect;
export type WellnessEntry = typeof wellnessEntries.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
