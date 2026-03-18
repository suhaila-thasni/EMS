import { Router } from "express";
import { markAttendance, getAttendanceHistory, getDailyStatus, getAllAttendance, getPersonalStats, exportAllAttendance, updateAttendance, deleteAttendance, createAttendance } from "../controllers/attendanceController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

const router = Router();

router.post("/mark", authenticate, markAttendance);
router.get("/history", authenticate, getAttendanceHistory);
router.get("/status", authenticate, getDailyStatus);
router.get("/personal-stats", authenticate, getPersonalStats);
router.get("/all", authenticate, authorizeAdmin, getAllAttendance);
router.get("/export", authenticate, exportAllAttendance);

// Admin CRUD
router.post("/", authenticate, authorizeAdmin, createAttendance);
router.put("/:id", authenticate, authorizeAdmin, updateAttendance);
router.delete("/:id", authenticate, authorizeAdmin, deleteAttendance);

export default router;
