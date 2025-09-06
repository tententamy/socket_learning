import { Router } from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/auth";
import { MessageController } from "../controllers/MessageController";
import { Server } from "socket.io";

const upload = multer({ dest: path.join(__dirname, "../../uploads") });

export default function messageRoutes(io: Server) {
  const router = Router();
  const messageController = new MessageController(io);

  router.get("/", authMiddleware, messageController.getAll);
  router.post(
    "/uploads",
    authMiddleware,
    upload.single("file"),
    messageController.upload
  );

  return router;
}
