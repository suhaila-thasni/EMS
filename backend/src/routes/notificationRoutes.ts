import { Router } from "express";
import { getNotifications, markAsRead, createNotification, deleteNotification, clearAllNotifications } from "../controllers/notificationController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

const router = Router();

// Get all notifications for the current user
router.get("/", authenticate, getNotifications);

// Mark a specific notification as read
router.patch("/:id/read", authenticate, markAsRead);

// Create a notification (Admin only or system internal)
router.post("/", authenticate, authorizeAdmin, createNotification);

// Clear all notifications for the current user
router.delete("/clear-all", authenticate, clearAllNotifications);

// Delete a single notification
router.delete("/:id", authenticate, deleteNotification);

export default router;
