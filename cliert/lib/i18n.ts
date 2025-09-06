export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // Home page
    'app.title': 'Chat App',
    'app.subtitle': 'Kết nối với mọi người',
    'app.description': 'Ứng dụng chat hiện đại với khả năng gửi tin nhắn, chia sẻ file và kết nối real-time',
    'app.startChat': 'Bắt đầu chat ngay',
    'app.createAccount': 'Tạo tài khoản',
    'app.login': 'Đăng nhập',
    'app.register': 'Đăng ký',
    'app.logout': 'Đăng xuất',
    'app.home': 'Trang chủ',
    
    // Auth
    'auth.welcome': 'Chào mừng bạn quay trở lại!',
    'auth.createAccount': 'Tạo tài khoản mới để bắt đầu chat',
    'auth.username': 'Tên đăng nhập',
    'auth.password': 'Mật khẩu',
    'auth.usernamePlaceholder': 'Nhập tên đăng nhập',
    'auth.passwordPlaceholder': 'Nhập mật khẩu',
    'auth.noAccount': 'Chưa có tài khoản?',
    'auth.hasAccount': 'Đã có tài khoản?',
    'auth.registerNow': 'Đăng ký ngay',
    'auth.backToHome': '← Quay lại trang chủ',
    'auth.checking': 'Đang kiểm tra đăng nhập...',
    
    // Chat
    'chat.welcome': 'Xin chào, {username}!',
    'chat.messagePlaceholder': 'Nhập tin nhắn...',
    'chat.send': 'Gửi',
    'chat.sending': '⏳ Đang gửi...',
    'chat.connected': '✅ Đã kết nối',
    'chat.disconnected': '❌ Mất kết nối',
    
    // Features
    'features.realtime': 'Tin nhắn real-time',
    'features.realtimeDesc': 'Gửi và nhận tin nhắn tức thì với công nghệ WebSocket hiện đại',
    'features.files': 'Chia sẻ file đa dạng',
    'features.filesDesc': 'Upload và chia sẻ hình ảnh, video, âm thanh, tài liệu và nhiều loại file khác',
    'features.security': 'Bảo mật cao',
    'features.securityDesc': 'Hệ thống xác thực JWT với refresh token, đảm bảo an toàn cho dữ liệu của bạn',
    
    // File types
    'file.download': 'Tải xuống',
    'file.view': 'Xem',
    'file.viewPdf': 'Xem PDF',
    
    // Footer
    'footer.copyright': '© 2024 Chat App. Được xây dựng với Next.js và Socket.io'
  },
  en: {
    // Home page
    'app.title': 'Chat App',
    'app.subtitle': 'Connect with everyone',
    'app.description': 'Modern chat application with messaging, file sharing and real-time connection capabilities',
    'app.startChat': 'Start chatting now',
    'app.createAccount': 'Create account',
    'app.login': 'Login',
    'app.register': 'Register',
    'app.logout': 'Logout',
    'app.home': 'Home',
    
    // Auth
    'auth.welcome': 'Welcome back!',
    'auth.createAccount': 'Create a new account to start chatting',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.usernamePlaceholder': 'Enter username',
    'auth.passwordPlaceholder': 'Enter password',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.registerNow': 'Register now',
    'auth.backToHome': '← Back to home',
    'auth.checking': 'Checking login...',
    
    // Chat
    'chat.welcome': 'Hello, {username}!',
    'chat.messagePlaceholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.sending': '⏳ Sending...',
    'chat.connected': '✅ Connected',
    'chat.disconnected': '❌ Disconnected',
    
    // Features
    'features.realtime': 'Real-time messaging',
    'features.realtimeDesc': 'Send and receive messages instantly with modern WebSocket technology',
    'features.files': 'Diverse file sharing',
    'features.filesDesc': 'Upload and share images, videos, audio, documents and many other file types',
    'features.security': 'High security',
    'features.securityDesc': 'JWT authentication system with refresh token, ensuring security for your data',
    
    // File types
    'file.download': 'Download',
    'file.view': 'View',
    'file.viewPdf': 'View PDF',
    
    // Footer
    'footer.copyright': '© 2024 Chat App. Built with Next.js and Socket.io'
  }
};

export const getTranslation = (key: string, lang: Language, params?: Record<string, string>): string => {
  let text = translations[lang][key as keyof typeof translations[typeof lang]] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value);
    });
  }
  
  return text;
};
