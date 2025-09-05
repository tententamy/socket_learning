import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRoutes from "./routes/auth";
import messageRoutes from "./routes/messages";
import { ChatSocket } from "./socket/ChatSocket";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "http://localhost:4000" } });
new ChatSocket(io);

httpServer.listen(6112, () => {
  console.log("🚀 Server running at http://localhost:6112");
});
