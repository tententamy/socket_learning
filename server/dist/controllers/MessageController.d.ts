import { Request, Response } from "express";
import { Server } from "socket.io";
export declare class MessageController {
    private io;
    constructor(io: Server);
    getAll: (req: Request, res: Response) => Promise<void>;
    upload: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
