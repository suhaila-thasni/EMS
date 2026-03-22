import { query } from "../src/config/db";

async function migrate() {
  console.log("Applying Settings Migration...");
  try {
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS high_fidelity_maps BOOLEAN DEFAULT FALSE;");
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_sync_gps BOOLEAN DEFAULT FALSE;");
    console.log("Migration Successful! Settings columns added.");
  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
