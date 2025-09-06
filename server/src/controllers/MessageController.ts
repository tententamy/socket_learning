import { Request, Response } from "express";
import { prisma } from "../config/db";
import { Server } from "socket.io";
import cloudinary from "../config/cloudinary";
import fs from "fs";

export class MessageController {
  constructor(private io: Server) {}

  getAll = async (req: Request, res: Response) => {
    try {
    const messages = await prisma.message.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);  // 🚀 trả thẳng array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
  };

  upload = async (req: Request, res: Response) => {
    const file = req.file;
    const user = (req as any).user;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Upload file lên Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "chat-app",
        resource_type: "auto",
      });

      // Xoá file tạm local
      fs.unlinkSync(file.path);

      res.json({
        url: result.secure_url,
        fileName: file.originalname,
      });
    } catch (err) {
      console.error("❌ Upload failed", err);
      res.status(500).json({ error: "Upload failed" });
    }
  };
}
