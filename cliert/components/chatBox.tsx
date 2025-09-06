"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: number;
  content: string | null;
  createdAt: string;
  type: "TEXT" | "FILE";
  fileUrl?: string | null;
  fileName?: string | null;
  user: { id: number; username: string };
}

export default function ChatBox() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io("http://localhost:6112", {
      auth: { token },
    });

    socketInstance.on("connect", () =>
      console.log("✅ Connected:", socketInstance.id)
    );
    socketInstance.on("message", (m: Message) => {
      setMessages((prev) => [...prev, m]);
    });

    setSocket(socketInstance);

    // fetch tin nhắn cũ
    fetch("http://localhost:6112/messages", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((msgs: Message[]) => setMessages(msgs));

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!socket) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Nếu có file -> gửi file
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:6112/messages/uploads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      socket.emit("message", {
        type: "FILE",
        content: null,
        fileUrl: data.url,
        fileName: data.fileName,
      });

      setFile(null);

      // reset input file
      const input = document.getElementById("fileInput") as HTMLInputElement;
      if (input) input.value = "";

      return;
    }

    // Nếu có text -> gửi text
    if (msg.trim()) {
      socket.emit("message", { type: "TEXT", content: msg.trim() });
      setMsg("");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 flex ${
              m.user.username === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs ${
                m.user.username === username
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <span className="text-xs font-bold">{m.user.username}</span>

              {m.type === "TEXT" && m.content && <div>{m.content}</div>}

              {m.type === "FILE" && m.fileUrl && (
                <>
                  {m.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={`http://localhost:6112${m.fileUrl}`}
                      alt={m.fileName || "image"}
                      className="max-w-[200px] rounded mt-1"
                    />
                  ) : m.fileUrl.match(/\.(mp4|webm)$/i) ? (
                    <video controls className="max-w-[250px] rounded mt-1">
                      <source
                        src={`http://localhost:6112${m.fileUrl}`}
                        type="video/mp4"
                      />
                    </video>
                  ) : (
                    <a
                      href={`http://localhost:6112${m.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-sm mt-1 inline-block"
                    >
                      📎 {m.fileName}
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex p-3 border-t gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder={file ? file.name : "Nhập tin nhắn..."}
          disabled={!!file}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer bg-gray-300 px-3 py-2 rounded"
        >
          📎
        </label>
        <button
          onClick={sendMessage}
          disabled={!msg.trim() && !file}
          className={`px-4 py-2 rounded ${
            msg.trim() || file
              ? "bg-blue-500 text-white"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
