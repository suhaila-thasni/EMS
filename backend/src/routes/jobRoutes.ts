import { Router } from "express";
import { getJobs, createJob, updateJob, deleteJob } from "../controllers/jobController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/all", getJobs);
router.post("/create", authenticate as any, authorizeAdmin as any, createJob);
router.put("/update/:id", authenticate as any, authorizeAdmin as any, updateJob);
router.delete("/delete/:id", authenticate as any, authorizeAdmin as any, deleteJob);

export default router;
