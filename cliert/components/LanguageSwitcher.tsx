"use client";

import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'vi' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        🇻🇳 VI
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'en' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        🇺🇸 EN
      </button>
    </div>
  );
}
