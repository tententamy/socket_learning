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

    socket.on(
      "message",
      async (data: {
        type: "TEXT" | "FILE";
        content?: string | null;
        fileUrl?: string | null;
        fileName?: string | null;
      }) => {
        try {
          let newMessage;

          if (data.type === "TEXT" && data.content?.trim()) {
            newMessage = await prisma.message.create({
              data: {
                type: "TEXT",
                content: data.content,
                userId: (user as any).id,
              },
              include: { user: true },
            });
          } else if (data.type === "FILE" && data.fileUrl) {
            newMessage = await prisma.message.create({
              data: {
                type: "FILE",
                fileUrl: data.fileUrl,
                fileName: data.fileName || null,
                userId: (user as any).id,
              },
              include: { user: true },
            });
          } else {
            console.warn("🚫 Invalid message payload", data);
            return;
          }

          this.io.emit("message", newMessage);
        } catch (err) {
          console.error("❌ Error saving message:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", user);
    });
  }
}
