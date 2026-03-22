import { query } from "../src/config/db";

async function migrate() {
  console.log("Applying Extended Settings Migration...");
  try {
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_strict BOOLEAN DEFAULT FALSE;");
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS key_rotation BOOLEAN DEFAULT FALSE;");
    console.log("Migration Successful! All production settings columns added.");
  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
