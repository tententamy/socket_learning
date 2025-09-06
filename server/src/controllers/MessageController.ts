import { Request, Response } from "express";
import { prisma } from "../config/db";
import { Server } from "socket.io";
import cloudinary from "../config/cloudinary";
import multer from "multer";

export class MessageController {
  constructor(private io: Server) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const messages = await prisma.message.findMany({
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
      });
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  };

  upload = async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Thử upload với resource_type: "raw" trước
      let result;
      try {
        result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: "chat-app",
            resource_type: "raw",
            public_id: file.originalname, // Giữ nguyên tên file với extension
            use_filename: true,
            unique_filename: false,
          }
        );
      } catch (rawError) {
        // Nếu raw thất bại, thử với "auto"
        console.log("Raw upload failed, trying auto...");
        result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: "chat-app",
            resource_type: "auto",
            public_id: file.originalname, // Giữ nguyên tên file với extension
            use_filename: true,
            unique_filename: false,
          }
        );
      }

      res.json({
        url: result.secure_url,
        fileName: file.originalname,
        fileType: result.resource_type || "raw",
      });
    } catch (err) {
      console.error("❌ Upload failed", err);
      res.status(500).json({ error: "Upload failed for this file type" });
    }
  };
}