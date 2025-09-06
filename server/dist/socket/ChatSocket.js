"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
class ChatSocket {
    constructor(io) {
        this.io = io;
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token)
                return next(new Error("No token"));
            try {
                const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.user = user;
                next();
            }
            catch {
                next(new Error("Invalid token"));
            }
        });
        this.io.on("connection", this.handleConnection.bind(this));
    }
    handleConnection(socket) {
        const user = socket.user;
        console.log("⚡ User connected:", user);
        socket.on("message", async (data) => {
            try {
                let newMessage;
                if (data.type === "TEXT" && data.content?.trim()) {
                    newMessage = await db_1.prisma.message.create({
                        data: {
                            type: "TEXT",
                            content: data.content,
                            userId: user.id,
                        },
                        include: { user: true },
                    });
                }
                else if (data.type === "FILE" && data.fileUrl) {
                    newMessage = await db_1.prisma.message.create({
                        data: {
                            type: "FILE",
                            fileUrl: data.fileUrl,
                            fileName: data.fileName || null,
                            userId: user.id,
                        },
                        include: { user: true },
                    });
                }
                else {
                    console.warn("🚫 Invalid message payload", data);
                    return;
                }
                this.io.emit("message", newMessage);
            }
            catch (err) {
                console.error("❌ Error saving message:", err);
            }
        });
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", user);
        });
    }
}
exports.ChatSocket = ChatSocket;
//# sourceMappingURL=ChatSocket.js.map