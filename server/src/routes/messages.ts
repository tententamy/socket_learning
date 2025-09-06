import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth";
import { MessageController } from "../controllers/MessageController";
import { Server } from "socket.io";

// Memory storage với limit cao
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => cb(null, true)
});

export default function messageRoutes(io: Server) {
  const router = Router();
  const messageController = new MessageController(io);

  router.get("/", authMiddleware, messageController.getAll);
  router.post("/uploads", authMiddleware, upload.single("file"), messageController.upload);
  router.get("/download", messageController.download);
  router.get("/download-link", messageController.getDownloadLink);
  router.get("/file-bytes", authMiddleware, messageController.getFileBytes);
router.post("/make-public", authMiddleware, messageController.makeFilesPublic);

  return router;
}