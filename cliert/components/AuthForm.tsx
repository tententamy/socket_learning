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
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (type === "login" && data.token) {
      localStorage.setItem("token", data.token);
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
    <div className="flex flex-col gap-3 max-w-sm mx-auto p-4">
      <h2 className="font-bold text-xl">{type === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
      <input
        className="border p-2 rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-3 py-2 rounded">
        {type === "login" ? "Đăng nhập" : "Đăng ký"}
      </button>
    </div>
  );
}
