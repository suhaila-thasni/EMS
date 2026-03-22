import { Router } from "express";
import { getJobs, createJob, updateJob, deleteJob, applyToJob, submitReferral, getApplications, getReferrals } from "../controllers/jobController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/all", getJobs);
router.post("/create", authenticate as any, authorizeAdmin as any, createJob);
router.put("/update/:id", authenticate as any, authorizeAdmin as any, updateJob);
router.delete("/delete/:id", authenticate as any, authorizeAdmin as any, deleteJob);

// Application & Referral Endpoints
router.post("/apply", authenticate as any, applyToJob);
router.post("/refer", authenticate as any, submitReferral);

// Admin Only - View Applications & Referrals
router.get("/applications", authenticate as any, authorizeAdmin as any, getApplications);
router.get("/referrals", authenticate as any, authorizeAdmin as any, getReferrals);

export default router;
