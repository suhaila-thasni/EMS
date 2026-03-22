import { Router } from "express";
import { getActivityLogs } from "../controllers/activityController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Get activity logs for the current user
router.get("/", authenticate, getActivityLogs);

export default router;
