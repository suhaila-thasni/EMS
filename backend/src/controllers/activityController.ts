import { Response } from "express";
import { query } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await query(
      `SELECT id, action, details, metadata, created_at 
       FROM activity_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      "SELECT COUNT(*) FROM activity_logs WHERE user_id = $1",
      [userId]
    );

    res.json({
      success: true,
      activities: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error: any) {
    console.error("[ACTIVITY] Failed to get activity logs:", error.message);
    res
      .status(500)
      .json({ success: false, message: `Database error: ${error.message}` });
  }
};
