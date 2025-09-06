"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const messages_1 = __importDefault(require("./routes/messages"));
const ChatSocket_1 = require("./socket/ChatSocket");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: { origin: ["http://localhost:4000", "http://10.2.51.31:4000"] } });
new ChatSocket_1.ChatSocket(io);
app.use("/auth", auth_1.default);
app.use("/messages", (0, messages_1.default)(io)); // 👈 truyền io vào routes
httpServer.listen(6112, () => {
    console.log("🚀 Server running at http://localhost:6112");
});
//# sourceMappingURL=server.js.map