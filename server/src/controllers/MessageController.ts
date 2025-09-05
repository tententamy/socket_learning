import { Request, Response } from "express";
import { prisma } from "../config/db";

export class MessageController {
  static async getAll(req: Request, res: Response) {
    const messages = await prisma.message.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: "asc" }
    });
    res.json(messages);
  }
}
