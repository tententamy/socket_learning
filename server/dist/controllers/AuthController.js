"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthController {
    static async register(req, res) {
        const { username, password } = req.body;
        try {
            const hashed = await bcrypt_1.default.hash(password, 10);
            const user = await db_1.prisma.user.create({
                data: { username, password: hashed }
            });
            res.json({ id: user.id, username: user.username });
        }
        catch (err) {
            res.status(400).json({ error: "Username already exists" });
        }
    }
    static async login(req, res) {
        const { username, password } = req.body;
        const user = await db_1.prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(400).json({ error: "User not found" });
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ error: "Invalid password" });
        // Access token (ngắn hạn)
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "15m" });
        // Refresh token (dài hạn)
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        // Lưu refresh token trong DB (để có thể revoke khi logout)
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });
        res.json({ accessToken, refreshToken });
    }
    static async refresh(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(401).json({ error: "No refresh token" });
        try {
            // Xác thực refresh token
            const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await db_1.prisma.user.findUnique({ where: { id: payload.id } });
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ error: "Invalid refresh token" });
            }
            // Cấp access token mới
            const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "15m" });
            res.json({ accessToken: newAccessToken });
        }
        catch (err) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }
    }
    static async logout(req, res) {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: "Not authenticated" });
        try {
            // Xóa refresh token khỏi database
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: "" }
            });
            res.json({ message: "Logged out successfully" });
        }
        catch (err) {
            console.error("Logout error:", err);
            res.status(500).json({ error: "Logout failed" });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map