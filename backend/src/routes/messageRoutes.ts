import { Router } from "express";
import { getMessages, createMessage, updateMessage, deleteMessage } from "../controllers/messageController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/all", getMessages);
router.post("/create", authenticate as any, authorizeAdmin as any, createMessage);
router.put("/update/:id", authenticate as any, authorizeAdmin as any, updateMessage);
router.delete("/delete/:id", authenticate as any, authorizeAdmin as any, deleteMessage);

export default router;
