import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, matches, Match, InsertMatch, teamStats, TeamStat, InsertTeamStat, predictions, Prediction, InsertPrediction } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from 'bcryptjs';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "username", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Local Authentication Functions =====

export async function createLocalUser(username: string, password: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if username already exists
  const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existing.length > 0) {
    throw new Error("Username already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generate unique openId for local users
  const openId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  await db.insert(users).values({
    openId,
    username,
    passwordHash,
    name: name || username,
    loginMethod: 'local',
    role: 'user',
    lastSignedIn: new Date(),
  });

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0];
}

export async function verifyLocalUser(username: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  if (!user.passwordHash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return user;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Match Functions =====

export async function createMatch(match: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(matches).values(match);
  
  // Get the inserted match
  const result = await db.select().from(matches)
    .where(and(
      eq(matches.homeTeam, match.homeTeam),
      eq(matches.awayTeam, match.awayTeam),
      eq(matches.week, match.week)
    ))
    .limit(1);
  
  return result[0];
}

export async function updateMatch(id: number, match: Partial<InsertMatch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(matches).set(match).where(eq(matches.id, id));
  
  const result = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return result[0];
}

export async function deleteMatch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related team stats
  await db.delete(teamStats).where(eq(teamStats.matchId, id));
  
  // Delete related predictions
  await db.delete(predictions).where(eq(predictions.matchId, id));
  
  // Delete match
  await db.delete(matches).where(eq(matches.id, id));
}

export async function getAllMatches() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(matches).orderBy(desc(matches.matchDate));
}

export async function getMatchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMatchesByWeek(week: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(matches).where(eq(matches.week, week)).orderBy(matches.matchDate);
}

// ===== Team Stats Functions =====

export async function createTeamStat(stat: InsertTeamStat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(teamStats).values(stat);
}

export async function getTeamStatsByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(teamStats).where(eq(teamStats.matchId, matchId));
}

export async function updateTeamStat(id: number, stat: Partial<InsertTeamStat>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(teamStats).set(stat).where(eq(teamStats.id, id));
}

export async function deleteTeamStatsByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(teamStats).where(eq(teamStats.matchId, matchId));
}

// ===== Prediction Functions =====

export async function createPrediction(prediction: InsertPrediction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already has a prediction for this match
  const existing = await db.select().from(predictions)
    .where(and(
      eq(predictions.userId, prediction.userId),
      eq(predictions.matchId, prediction.matchId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing prediction
    await db.update(predictions)
      .set({
        predictedHomeScore: prediction.predictedHomeScore,
        predictedAwayScore: prediction.predictedAwayScore,
        predictedResult: prediction.predictedResult,
        updatedAt: new Date(),
      })
      .where(eq(predictions.id, existing[0].id));
    
    return existing[0];
  } else {
    // Create new prediction
    await db.insert(predictions).values(prediction);
    
    const result = await db.select().from(predictions)
      .where(and(
        eq(predictions.userId, prediction.userId),
        eq(predictions.matchId, prediction.matchId)
      ))
      .limit(1);
    
    return result[0];
  }
}

export async function getPredictionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(predictions).where(eq(predictions.userId, userId));
}

export async function getPredictionsByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(predictions).where(eq(predictions.matchId, matchId));
}

export async function getUserPredictionForMatch(userId: number, matchId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(predictions)
    .where(and(
      eq(predictions.userId, userId),
      eq(predictions.matchId, matchId)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPredictions() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
}
