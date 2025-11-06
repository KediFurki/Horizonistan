import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const db = drizzle(process.env.DATABASE_URL);

async function updateAdmin() {
  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash("123kedi456", 10);
    
    // Update admin user
    await db.update(users)
      .set({
        username: "admin",
        passwordHash: hashedPassword,
      })
      .where(eq(users.role, "admin"));
    
    console.log("✅ Admin kullanıcısı güncellendi!");
    console.log("   Kullanıcı Adı: admin");
    console.log("   Şifre: 123kedi456");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

updateAdmin();
