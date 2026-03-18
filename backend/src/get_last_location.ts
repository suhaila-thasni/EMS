import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function getLastLocation() {
  try {
    const res = await pool.query("SELECT latitude, longitude FROM attendance ORDER BY created_at DESC LIMIT 1;");
    if (res.rows.length > 0) {
      console.log(JSON.stringify(res.rows[0]));
    } else {
      console.log("No attendance records found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

getLastLocation();
