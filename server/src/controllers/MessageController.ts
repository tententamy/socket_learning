import { Request, Response } from "express";
import { prisma } from "../config/db";
import { Server } from "socket.io";

export class MessageController {
  constructor(private io: Server) {}

  getAll = async (req: Request, res: Response) => {
    const messages = await prisma.message.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  };

  upload = async (req: Request, res: Response) => {
    const file = req.file;
    const user = (req as any).user; // từ authMiddleware
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Tạo message trong DB
    const newMessage = await prisma.message.create({
      data: {
        type: "FILE",  
        content: "", // nếu cần thêm message text thì lấy từ req.body.content
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        userId: user.id,
      },
      include: { user: true },
    });

    // Emit qua socket
    this.io.emit("message", newMessage);

    res.json(newMessage);
  };
}
