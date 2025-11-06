import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function createAdmin() {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin User";

  console.log(`Creating admin user: ${username}`);

  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    if (existing.length > 0) {
      console.log(`User ${username} already exists. Updating to admin role...`);
      
      // Update existing user to admin
      await db.update(users)
        .set({ role: "admin" })
        .where(eq(users.username, username));
      
      console.log(`✅ User ${username} is now an admin`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      const openId = `local_admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await db.insert(users).values({
        openId,
        username,
        passwordHash,
        name,
        loginMethod: "local",
        role: "admin",
        lastSignedIn: new Date(),
      });

      console.log(`✅ Admin user created successfully!`);
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      console.log(`Name: ${name}`);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }

  process.exit(0);
}

createAdmin();
