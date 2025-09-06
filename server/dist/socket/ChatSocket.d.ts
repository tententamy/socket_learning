import { Server } from "socket.io";
export declare class ChatSocket {
    private io;
    constructor(io: Server);
    private handleConnection;
}
