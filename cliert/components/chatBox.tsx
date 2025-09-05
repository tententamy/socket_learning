"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: number;
  content: string;
  createdAt: string;
  user: { id: number; username: string };
}

export default function ChatBox() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io("http://localhost:6112", {
      auth: { token }
    });

    socketInstance.on("connect", () => console.log("✅ Connected:", socketInstance.id));

    socketInstance.on("message", (m: Message) => {
      setMessages((prev) => [...prev, m]);
    });

    setSocket(socketInstance);
    return () => { socketInstance.disconnect(); };
  }, []);

  const sendMessage = () => {
    if (msg.trim() && socket) {
      socket.emit("message", { content: msg });
      setMsg("");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 flex ${m.user.username === username ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs ${
                m.user.username === username
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <span className="text-xs font-bold">{m.user.username}</span>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex p-3 border-t">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 border rounded px-3 py-2 mr-2"
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
          Gửi
        </button>
      </div>
    </div>
  );
}
