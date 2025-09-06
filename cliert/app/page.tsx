"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthAndAutoLogin } from "../lib/fetchWithAuth";
import AuthForm from "../components/AuthForm";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthAndAutoLogin();
        if (isAuthenticated) {
          router.push("/chat");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.log("Auth check failed:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">💬</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat App</h1>
            <p className="text-gray-600">Đăng nhập để tiếp tục</p>
          </div>
          <AuthForm type="login" />
          <div className="text-center mt-6">
            <button 
              onClick={() => setShowLogin(false)} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center gap-1 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">💬</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Chat App</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowLogin(true)} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => router.push("/register")} 
                className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-2 rounded-xl font-medium transition-all border border-gray-200 shadow-sm hover:shadow-md"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 sm:text-6xl md:text-7xl mb-6">
            Kết nối với <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">mọi người</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl md:text-2xl leading-relaxed">
            Ứng dụng chat hiện đại với khả năng gửi tin nhắn, chia sẻ file đa dạng và kết nối real-time
          </p>
          <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center gap-4">
            <button 
              onClick={() => setShowLogin(true)} 
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Bắt đầu chat ngay
            </button>
            <button 
              onClick={() => router.push("/register")} 
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-gray-800 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Tạo tài khoản
            </button>
          </div>
        </div>

        <div className="mt-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Khám phá những tính năng mạnh mẽ giúp bạn kết nối và chia sẻ dễ dàng</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tin nhắn real-time</h3>
                <p className="text-gray-600 leading-relaxed">Gửi và nhận tin nhắn tức thì với công nghệ WebSocket hiện đại, đảm bảo kết nối ổn định</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Chia sẻ file đa dạng</h3>
                <p className="text-gray-600 leading-relaxed">Upload và chia sẻ hình ảnh, video, âm thanh, tài liệu và nhiều loại file khác với dung lượng lên đến 200MB</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Bảo mật cao</h3>
                <p className="text-gray-600 leading-relaxed">Hệ thống xác thực JWT với refresh token, đảm bảo an toàn tuyệt đối cho dữ liệu của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">💬</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Chat App</span>
            </div>
            <p className="text-gray-500 mb-4">© 2024 Chat App. Được xây dựng với Next.js và Socket.io</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>🚀 Real-time messaging</span>
              <span>📁 File sharing</span>
              <span>🔒 Secure authentication</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}