import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    console.log(`[NOTIF] Fetching for user: ${userId}`);
    const result = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ success: true, notifications: result.rows });
  } catch (error: any) {
    console.error("[NOTIF_ERROR] Failed to get notifications:", error.message);
    res.status(500).json({ success: false, message: `Database error: ${error.message}` });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error: any) {
    console.error("Mark As Read Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  const { userId, title, message, type } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const id = uuidv4();
    await query(
      "INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, $3, $4, $5)",
      [id, userId, title, message, type || "info"]
    );
    res.status(201).json({ success: true, message: "Notification created successfully" });
  } catch (error: any) {
    console.error("Create Notification Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
