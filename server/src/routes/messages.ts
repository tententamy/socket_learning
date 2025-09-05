// messages.ts
import { Router } from "express";
import { MessageController } from "../controllers/MessageController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.get("/", authMiddleware, MessageController.getAll);
export default router;
