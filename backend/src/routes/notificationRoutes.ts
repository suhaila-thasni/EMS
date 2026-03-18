import { Router } from "express";
import { getNotifications, markAsRead, createNotification } from "../controllers/notificationController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

const router = Router();

// Get all notifications for the current user
router.get("/", authenticate, getNotifications);

// Mark a specific notification as read
router.patch("/:id/read", authenticate, markAsRead);

// Create a notification (Admin only or system internal)
router.post("/", authenticate, authorizeAdmin, createNotification);

export default router;
