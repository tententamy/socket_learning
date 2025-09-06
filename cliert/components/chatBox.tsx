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
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0); // 👈 progress
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io("http://localhost:6112", { auth: { token } });

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
      .then((msgs) =>
        Array.isArray(msgs) ? setMessages(msgs) : setMessages([])
      );

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!socket || isSending) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSending(true);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "http://localhost:6112/messages/uploads");
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded * 100) / e.total);
              setUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              socket.emit("message", {
                type: "FILE",
                content: null,
                fileUrl: data.url,
                fileName: data.fileName,
              });
              setFile(null);
              setUploadProgress(0);
              const input = document.getElementById(
                "fileInput"
              ) as HTMLInputElement;
              if (input) input.value = "";
              resolve();
            } else {
              reject("Upload failed");
            }
          };

          xhr.onerror = reject;
          xhr.send(formData);
        });
      } else if (msg.trim()) {
        socket.emit("message", { type: "TEXT", content: msg.trim() });
        setMsg("");
      }
    } catch (err) {
      console.error("❌ Lỗi gửi tin nhắn:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((m) => {
          const isMe = m.user.username === username;
          return (
            <div
              key={m.id}
              className={`mb-4 flex flex-col ${
                isMe ? "items-end" : "items-start"
              }`}
            >
              {/* tên user ngoài bong bóng */}
              <span className="text-xs font-semibold text-gray-500 mb-1">
                {m.user.username}
              </span>

              <div
                className={`p-2 rounded-2xl max-w-xs break-words ${
                  isMe
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {m.type === "TEXT" && m.content && <div>{m.content}</div>}
                {m.type === "FILE" && m.fileUrl && (
                  <>
                    {m.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={m.fileUrl}
                        alt={m.fileName || "image"}
                        className="max-w-[200px] rounded mt-1"
                      />
                    ) : m.fileUrl.match(/\.(mp4|webm)$/i) ? (
                      <video controls className="max-w-[250px] rounded mt-1">
                        <source src={m.fileUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={m.fileName || true}
                        className="underline text-sm mt-1 inline-block"
                      >
                        📎 {m.fileName}
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* progress bar */}
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <div className="flex p-3 border-t gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder={file ? file.name : "Nhập tin nhắn..."}
          disabled={!!file || isSending}
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
          disabled={(!msg.trim() && !file) || isSending}
          className={`px-4 py-2 rounded ${
            msg.trim() || file
              ? "bg-blue-500 text-white"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {isSending ? "⏳ Đang gửi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}
