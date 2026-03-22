import { Router } from "express";
import { register, login, forgotPassword, verifyOtp, resetPassword, refreshToken, changePassword, getActiveSessions, revokeSession } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", authenticate, refreshToken);
router.post("/change-password", authenticate, changePassword);
router.get("/sessions", authenticate, getActiveSessions);
router.delete("/sessions/:id", authenticate, revokeSession);

export default router;
