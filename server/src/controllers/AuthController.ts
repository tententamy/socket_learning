import { Request, Response } from "express";
import { prisma } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, password: hashed }
      });
      res.json({ id: user.id, username: user.username });
    } catch (err) {
      res.status(400).json({ error: "Username already exists" });
    }
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    // Access token (ngắn hạn)
    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    // Refresh token (dài hạn)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // Lưu refresh token trong DB (để có thể revoke khi logout)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.json({ accessToken, refreshToken });
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    try {
      // Xác thực refresh token
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }

      // Cấp access token mới
      const newAccessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );

      res.json({ accessToken: newAccessToken });
    } catch (err) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }
  }

  static async logout(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    try {
      // Xóa refresh token khỏi database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: "" }
      });

      res.json({ message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({ error: "Logout failed" });
    }
  }

}
