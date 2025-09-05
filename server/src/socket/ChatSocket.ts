import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

export class ChatSocket {
  constructor(private io: Server) {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string);
        (socket as any).user = user;
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });

    this.io.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket) {
    const user = (socket as any).user;
    console.log("⚡ User connected:", user);

    socket.on("message", async (data: { content: string; fileUrl?: string }) => {
      const newMessage = await prisma.message.create({
        data: { content: data.content, fileUrl: data.fileUrl, userId: (user as any).id },
        include: { user: true }
      });

      this.io.emit("message", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", user);
    });
  }
}
