import { query } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export const sendNotification = async (userId: string, title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
  try {
    const id = uuidv4();
    await query(
      "INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, $3, $4, $5)",
      [id, userId, title, message, type]
    );
    console.log(`[NOTIF] Created for User ${userId}: ${title}`);
  } catch (error) {
    console.error("[NOTIF_HELPER_ERROR] Failed to create notification:", error);
  }
};
