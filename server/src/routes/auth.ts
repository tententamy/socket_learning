// auth.ts
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", authMiddleware, AuthController.logout);
export default router;
