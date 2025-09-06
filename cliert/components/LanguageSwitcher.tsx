"use client";

import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'vi' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        🇻🇳 VI
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'en' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        🇺🇸 EN
      </button>
    </div>
  );
}
