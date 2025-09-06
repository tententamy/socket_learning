export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  // Nếu không có token, redirect về login
  if (!token && !refreshToken) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("No authentication token");
  }

  let res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 && refreshToken) {
    try {
      // gọi refresh
      const refreshRes = await fetch("http://localhost:6112/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        localStorage.setItem("token", accessToken);

        // gọi lại request cũ
        res = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        // Refresh token cũng hết hạn, logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired");
      }
    } catch (error) {
      // Lỗi network hoặc refresh token invalid
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    }
  }

  return res;
}

// Hàm kiểm tra và auto-login
export async function checkAuthAndAutoLogin() {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const username = localStorage.getItem("username");

  if (!token && !refreshToken) {
    return false;
  }

  if (token) {
    // Kiểm tra token hiện tại có còn valid không
    try {
      const res = await fetch("http://localhost:6112/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return true; // Token còn valid
      }
    } catch (error) {
      console.log("Token check failed:", error);
    }
  }

  // Nếu token không valid, thử refresh
  if (refreshToken) {
    try {
      const refreshRes = await fetch("http://localhost:6112/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        localStorage.setItem("token", accessToken);
        return true;
      } else {
        // Refresh token cũng hết hạn
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        return false;
      }
    } catch (error) {
      console.log("Auto-login failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      return false;
    }
  }

  return false;
}
