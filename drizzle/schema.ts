import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with username/password for local authentication.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Local authentication fields
  username: varchar("username", { length: 50 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Matches table - stores Premier League fixtures
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  
  // Match details
  homeTeam: varchar("homeTeam", { length: 100 }).notNull(),
  awayTeam: varchar("awayTeam", { length: 100 }).notNull(),
  matchDate: timestamp("matchDate").notNull(),
  
  // Week and day information
  week: int("week").notNull(), // Gameweek number
  day: varchar("day", { length: 50 }).notNull(), // e.g., "Saturday", "Sunday"
  
  // Actual result (filled after match is played)
  homeScore: int("homeScore"),
  awayScore: int("awayScore"),
  isFinished: boolean("isFinished").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Team statistics - last 5 matches form (W/D/L)
 */
export const teamStats = mysqlTable("teamStats", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  teamName: varchar("teamName", { length: 100 }).notNull(),
  
  // Last 5 matches form (e.g., "WWDLW" or "GBBMG")
  lastFiveForm: varchar("lastFiveForm", { length: 5 }).notNull(), // G=Galibiyet, B=Beraberlik, M=Mağlubiyet
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamStat = typeof teamStats.$inferSelect;
export type InsertTeamStat = typeof teamStats.$inferInsert;

/**
 * Predictions table - stores user predictions for matches
 */
export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  matchId: int("matchId").notNull(),
  
  // User's prediction
  predictedHomeScore: int("predictedHomeScore").notNull(),
  predictedAwayScore: int("predictedAwayScore").notNull(),
  predictedResult: mysqlEnum("predictedResult", ["home", "draw", "away"]).notNull(), // Home win, Draw, Away win
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;
