import { query } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export type ActivityAction =
  | "login"
  | "logout"
  | "profile_updated"
  | "password_changed"
  | "password_reset_requested"
  | "attendance_check_in"
  | "attendance_check_out"
  | "settings_updated"
  | "session_revoked"
  | "account_created";

export const logActivity = async (
  userId: string,
  action: ActivityAction,
  details: string,
  metadata?: Record<string, any>
) => {
  try {
    const id = uuidv4();
    await query(
      `INSERT INTO activity_logs (id, user_id, action, details, metadata) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, action, details, metadata ? JSON.stringify(metadata) : null]
    );
    console.log(`[ACTIVITY] Logged: ${action} for user ${userId}`);
  } catch (error) {
    console.error("[ACTIVITY_ERROR] Failed to log activity:", error);
    // Non-critical — don't throw, just log the error
  }
};
