"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = messageRoutes;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const MessageController_1 = require("../controllers/MessageController");
// Memory storage với limit cao
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    fileFilter: (req, file, cb) => cb(null, true)
});
function messageRoutes(io) {
    const router = (0, express_1.Router)();
    const messageController = new MessageController_1.MessageController(io);
    router.get("/", auth_1.authMiddleware, messageController.getAll);
    router.post("/uploads", auth_1.authMiddleware, upload.single("file"), messageController.upload);
    return router;
}
//# sourceMappingURL=messages.js.map