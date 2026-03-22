import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || "5432"),
  max: 20, // Strong connection ceiling
  idleTimeoutMillis: 30000, // Prune dormant links
  connectionTimeoutMillis: 2000, // Rapid failure detection
});

// Watch for catastrophic pool failures (Safe and Strong)
pool.on('error', (err) => {
  console.error('[DB] Unexpected artisan connection failure:', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
