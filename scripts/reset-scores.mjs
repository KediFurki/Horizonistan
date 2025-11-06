import { drizzle } from "drizzle-orm/mysql2";
import { userScores } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

console.log("Resetting all user scores...");

await db.delete(userScores);

console.log("All scores have been reset. Admin can now re-enter official scores to recalculate points.");
