"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { fetchWithAuth, checkAuthAndAutoLogin } from "../lib/fetchWithAuth";
import { useLanguage } from "../contexts/LanguageContext";

interface Message {
  id: number;
  content: string | null;
  createdAt: string;
  type: "TEXT" | "FILE";
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  user: { id: number; username: string };
}

export default function ChatBox() {
  const { t } = useLanguage();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";

  useEffect(() => {
    let socketInstance: Socket | null = null;

    const initializeChat = async () => {
      const isAuthenticated = await checkAuthAndAutoLogin();
      if (!isAuthenticated) {
        window.location.href = "/login";
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      socketInstance = io("http://localhost:6112", { auth: { token } });

      socketInstance.on("connect", () => console.log("✅ Connected:", socketInstance?.id));
      socketInstance.on("message", (m: Message) => {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === m.id);
          if (exists) return prev;
          return [...prev, m];
        });
      });

      socketInstance.on("connect_error", async (err: Error) => {
        if (err.message === "jwt expired") {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            const res = await fetch("http://localhost:6112/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
            if (res.ok) {
              const { accessToken } = await res.json();
              localStorage.setItem("token", accessToken);
              socketInstance = io("http://localhost:6112", { auth: { token: accessToken } });
              setSocket(socketInstance);
            } else {
              localStorage.clear();
              window.location.href = "/login";
            }
          }
        }
      });

      setSocket(socketInstance);

      try {
        const res = await fetchWithAuth("http://localhost:6112/messages");
        const msgs = await res.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      }
    };

    initializeChat();

    return () => {
      if (socketInstance) socketInstance.disconnect();
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
                fileType: data.fileType,
              });
              setFile(null);
              setUploadProgress(0);
              const input = document.getElementById("fileInput") as HTMLInputElement;
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) return '🖼️';
    if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext || '')) return '🎥';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return '🎵';
    if (['pdf'].includes(ext || '')) return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return '🗜️';
    return '📎';
  };

  const renderFile = (m: Message) => {
    if (!m.fileUrl) return null;
    
    const ext = m.fileName?.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
    const isVideo = ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext || '');
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '');

    if (isImage) {
      return <img src={m.fileUrl} alt={m.fileName || "image"} className="max-w-[200px] rounded mt-1" loading="lazy" />;
    }
    
    if (isVideo) {
      return <video controls className="max-w-[250px] rounded mt-1"><source src={m.fileUrl} type="video/mp4" /></video>;
    }
    
    if (isAudio) {
      return (
        <div className="mt-1">
          <audio controls className="w-full"><source src={m.fileUrl} type="audio/mpeg" /></audio>
          <p className="text-xs text-gray-600 mt-1">{m.fileName}</p>
        </div>
      );
    }

    return (
      <div className="mt-1 p-2 bg-gray-50 rounded border">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFileIcon(m.fileName || '')}</span>
          <div>
            <p className="text-sm font-medium">{m.fileName}</p>
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" download={m.fileName || true} className="text-xs text-blue-600 hover:underline">{t('file.download')}</a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((m, index) => {
          const isMe = m.user.username === username;
          return (
            <div key={`${m.id}-${m.createdAt}-${index}`} className={`mb-4 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-xs font-semibold text-gray-500 mb-1">{m.user.username}</span>
              <div className={`p-2 rounded-2xl max-w-xs break-words ${isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"}`}>
                {m.type === "TEXT" && m.content && <div>{m.content}</div>}
                {m.type === "FILE" && renderFile(m)}
              </div>
            </div>
          );
        })}
      </div>

      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 h-2 rounded">
          <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      <div className="flex p-3 border-t gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder={file ? file.name : t('chat.messagePlaceholder')}
          disabled={!!file || isSending}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
        <label htmlFor="fileInput" className="cursor-pointer bg-gray-300 px-3 py-2 rounded">📎</label>
        <button
          onClick={sendMessage}
          disabled={(!msg.trim() && !file) || isSending}
          className={`px-4 py-2 rounded ${msg.trim() || file ? "bg-blue-500 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
        >
          {isSending ? t('chat.sending') : t('chat.send')}
        </button>
      </div>
    </div>
  );
}