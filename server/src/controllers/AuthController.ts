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

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    res.json({ token });
  }
}
