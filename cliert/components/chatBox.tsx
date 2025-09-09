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
  fileSize?: number | null;
  mimeType?: string | null;
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
          const exists = prev.some((msg) => msg.id === m.id);
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
                fileSize: data.fileSize,
                mimeType: data.mimeType,
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

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (mimeType) {
      if (mimeType.startsWith("image/")) return "🖼️";
      if (mimeType.startsWith("video/")) return "🎥";
      if (mimeType.startsWith("audio/")) return "🎵";
      if (mimeType.includes("pdf")) return "📄";
      if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
      if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
      if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("archive")) return "🗜️";
      if (mimeType.includes("text")) return "📄";
    }

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext || "")) return "🖼️";
    if (["mp4", "webm", "avi", "mov", "mkv", "flv", "wmv"].includes(ext || "")) return "🎥";
    if (["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext || "")) return "🎵";
    if (["pdf"].includes(ext || "")) return "📄";
    if (["doc", "docx"].includes(ext || "")) return "📝";
    if (["xls", "xlsx", "csv"].includes(ext || "")) return "📊";
    if (["ppt", "pptx"].includes(ext || "")) return "📊";
    if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext || "")) return "🗜️";
    if (["txt", "md", "json", "xml", "html", "css", "js", "ts"].includes(ext || "")) return "📄";
    return "📎";
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      console.log(`🔄 Requesting download link for: ${fileName}`);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No token found");
        return;
      }

      const response = await fetch(
        `http://localhost:6112/messages/download-link?fileUrl=${encodeURIComponent(fileUrl)}&fileName=${encodeURIComponent(fileName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        console.error(`❌ Server response error: ${response.status} ${response.statusText}`);
        throw new Error("Failed to get download link");
      }

      const { downloadUrl } = await response.json();
      console.log("✅ Got download link:", downloadUrl);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName || "download";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      console.log("⬇️ Download started");
    } catch (error) {
      console.error("❌ Download error:", error);
      window.open(fileUrl, "_blank");
    }
  };

  const renderFile = (m: Message) => {
    if (!m.fileUrl) return null;

    const ext = m.fileName?.split(".").pop()?.toLowerCase();
    const isImage =
      m.mimeType?.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext || "");
    const isVideo =
      m.mimeType?.startsWith("video/") ||
      ["mp4", "webm", "avi", "mov", "mkv", "flv", "wmv"].includes(ext || "");
    const isAudio =
      m.mimeType?.startsWith("audio/") ||
      ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext || "");

    if (isImage) {
      return (
        <div className="mt-1">
          <img
            src={m.fileUrl!}
            alt={m.fileName || "image"}
            className="max-w-[200px] rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            loading="lazy"
            onClick={() => m.fileUrl && m.fileName && handleDownload(m.fileUrl, m.fileName)}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{m.fileName}</span>
            {m.fileSize && <span>{formatFileSize(m.fileSize)}</span>}
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="mt-1">
          <video controls className="max-w-[250px] rounded-lg shadow-sm" preload="metadata">
            <source src={m.fileUrl!} type={m.mimeType || "video/mp4"} />
          </video>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">{m.fileName}</span>
            <div className="flex items-center gap-2">
              {m.fileSize && <span>{formatFileSize(m.fileSize)}</span>}
              <button
                onClick={() => m.fileUrl && m.fileName && handleDownload(m.fileUrl, m.fileName)}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
          <audio controls className="w-full mb-2">
            <source src={m.fileUrl!} type={m.mimeType || "audio/mpeg"} />
          </audio>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-medium">{m.fileName}</span>
            <div className="flex items-center gap-2">
              {m.fileSize && <span>{formatFileSize(m.fileSize)}</span>}
              <button
                onClick={() => m.fileUrl && m.fileName && handleDownload(m.fileUrl, m.fileName)}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-1 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getFileIcon(m.fileName || "", m.mimeType || undefined)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{m.fileName}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {m.fileSize && <span>{formatFileSize(m.fileSize)}</span>}
              {m.mimeType && <span>• {m.mimeType}</span>}
            </div>
          </div>
          <button
            onClick={() => handleDownload(m.fileUrl!, m.fileName!)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
              <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          </div>
        ) : (
          messages.map((m, index) => {
            const isMe = m.user.username === username;
            const time = new Date(m.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={`${m.id}-${m.createdAt}-${index}`}
                className={`mb-6 flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600">{m.user.username}</span>
                  <span className="text-xs text-gray-400">{time}</span>
                </div>
                <div
                  className={`max-w-md break-words ${isMe ? "flex flex-col items-end" : "flex flex-col items-start"}`}
                >
                  {m.type === "TEXT" && m.content && (
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white text-gray-900 rounded-bl-md border"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  )}
                  {m.type === "FILE" && (
                    <div className={`${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      {renderFile(m)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {uploadProgress > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-t">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-blue-600 font-medium">{uploadProgress}%</span>
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-200 p-4">
        {file && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFileIcon(file.name, file.type)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  const input = document.getElementById("fileInput") as HTMLInputElement;
                  if (input) input.value = "";
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder={file ? `Gửi ${file.name}...` : "Nhập tin nhắn..."}
              disabled={isSending}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            />
          </div>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="fileInput"
            accept="*/*"
          />

          <label
            htmlFor="fileInput"
            className="flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"
            title="Đính kèm file"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>

          <button
            onClick={sendMessage}
            disabled={(!msg.trim() && !file) || isSending}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              (msg.trim() || file) && !isSending
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
