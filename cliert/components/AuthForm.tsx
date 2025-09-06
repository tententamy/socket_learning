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
        <div className="relative">
          <input
            id="username"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="password"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {type === "login" ? "Đăng nhập" : "Đăng ký"}
      </button>
      {type === "login" && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
