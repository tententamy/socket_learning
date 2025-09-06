"use client";

import { useRouter } from "next/navigation";
import ChatBox from "../../components/chatBox";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ChatPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:6112/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (error) {
      console.log("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      router.push("/");
    }
  };

  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-sm text-gray-600">{t('chat.welcome', { username })}</p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t('app.home')}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {t('app.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatBox />
      </div>
    </div>
  );
}