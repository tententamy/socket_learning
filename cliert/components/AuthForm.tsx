"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ type }: { type: "login" | "register" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(`http://localhost:6112/auth/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (type === "login" && data.accessToken && data.refreshToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("username", username);
      router.push("/chat");
    } else if (type === "register" && data.id) {
      alert("Đăng ký thành công, vui lòng đăng nhập");
      router.push("/login");
    } else {
      alert(data.error || "Thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Tên đăng nhập
        </label>
        <input
          id="username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu
        </label>
        <input
          id="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {type === "login" ? "Đăng nhập" : "Đăng ký"}
      </button>
      {type === "login" && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      )}
      {type === "register" && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
