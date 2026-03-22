import { Router } from "express";
import { getAllEmployees, getEmployeeStats, getComplianceAlerts, getComplianceLogs, getEmployeeById, updateEmployee, deleteEmployee, updateProfile, getNeuralReport, getSettings, updateSettings, searchEmployees, getSystemConfig, updateSystemConfig } from "../controllers/employeeController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/all", authenticate, getAllEmployees);
router.get("/search", authenticate, searchEmployees);
router.get("/stats", authenticate, getEmployeeStats);
router.get("/compliance", authenticate, authorizeAdmin, getComplianceAlerts);
router.get("/compliance-logs", authenticate, authorizeAdmin, getComplianceLogs);
router.get("/neural-report", authenticate, authorizeAdmin, getNeuralReport);

// CRUD routes
router.get("/settings", authenticate, getSettings);
router.patch("/settings", authenticate, updateSettings);
router.get("/shop-location", authenticate, getSystemConfig);
router.patch("/shop-location", authenticate, updateSystemConfig);
router.patch("/profile/update", authenticate, updateProfile);
router.get("/:id", authenticate, getEmployeeById);
router.put("/:id", authenticate, authorizeAdmin, updateEmployee);
router.delete("/:id", authenticate, authorizeAdmin, deleteEmployee);

export default router;
